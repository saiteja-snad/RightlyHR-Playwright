import { Component, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { environment } from '../../../environments/environment';
import { Paginator } from "primeng/paginator";
import { Table, TableModule } from 'primeng/table';
@Component({
  selector: 'app-await-on-user-helpdesk-ticket',
  imports: [CommonModule, RouterModule, NgbPopoverModule, NoDataFoundComponent, FormsModule,
    TranslateModule, ReactiveFormsModule, DataLoaderContentComponent, ProfileIconComponent, InfoIconComponent, Paginator, TableModule],
  templateUrl: './await-on-user-helpdesk-ticket.component.html',
  styleUrl: './await-on-user-helpdesk-ticket.component.scss'
})

export class AwaitOnUserHelpdeskTicketComponent {
  subscription!: Subscription;
  searchValue !: string;
  empinfo = {} as Ipersonal;
  tickets: any;
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  priorityDetails = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];
  selectedAssigneeId: any;
  dataloader: boolean = false;
  editableStatus: string = '';
  editableAssignee: number | null = null;
  selectedTicket: any;
  departmentDetails: any[] = [];
  allAssigneeEmployees: any[] = [];
  queriesdetailsForm!: FormGroup;
  dataloading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  searchSubject = new Subject<string>();
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  sortField = '';
  sortOrder = '';
  tableSortField = '';
  tableSortOrder = -1;
  readonly sortFieldMap: Record<string, string> = {
    id: 'id',
    employeeName: 'employeeName',
    createdDate: 'createdDate',
    category: 'category',
    subcategory: 'subcategory',
    status: 'status',
    priority: 'priority'
  };
  @ViewChild('dt') dt!: Table;

  constructor(private readonly http: HttpService, private readonly modalService: NgbModal,
    private fb: FormBuilder, public rbac: RbacService, public readonly router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getuserticketsbyempid();
    this.getDepartment();
    this.queriesdetailsForm = this.fb.group({
      assigneeId: [null],
      status: [null, Validators.required],
      priority: [null, Validators.required],
      comment: ['', [Validators.required, Validators.maxLength(100)]]
    });
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.first = 0;
      this.getuserticketsbyempid(this.page, this.pageSize);
    });
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getuserticketsbyempid(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getuserticketsbyempid(this.page, this.pageSize);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getuserticketsbyempid(this.page, this.pageSize);
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  onSort(event: any) {
    const field = String(event.field ?? '');
    const nextField = this.sortFieldMap[field] ?? field;
    const nextOrder = event.order === 1 ? 'asc' : 'desc';

    if (this.sortField === nextField && this.sortOrder === 'desc' && event.order === 1) {
      this.dt.reset();
      this.sortField = '';
      this.sortOrder = '';
      this.tableSortField = '';
      this.tableSortOrder = 1;
      this.page = 1;
      this.first = 0;
      this.getuserticketsbyempid();
      return;
    }

    if (this.sortField === nextField && this.sortOrder === nextOrder) return;

    this.sortField = nextField;
    this.sortOrder = nextOrder;
    this.tableSortField = field;
    this.tableSortOrder = event.order;
    this.page = 1;
    this.first = 0;
    this.getuserticketsbyempid();
  }

  // get help desk ticket data
  getuserticketsbyempid(page?: number, pageSize?: number) {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    let url = `HelpDeskQueries/AssignedTo/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}&status=Await On User`;
    const sortQuery = this.sortField && this.sortOrder ? `&Sorts=${this.sortField}:${this.sortOrder}` : '';
    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${this.searchValue}`;
    }
    url += sortQuery;
    this.subscription = this.http.getData(url).subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success && response.data) {
          this.tickets = response.data.data || [];
          this.collectionSize = response.data.totalAwaitOnUser;
        } else {
          this.tickets = [];
        }
      },
      error: (err: any) => {
        this.dataloader = false;
        this.tickets = [];
      }
    });
  }

  // get department-wise employees to show in assignee dropdown
  getDepartment() {
    this.dataloader = true;
    this.subscription = this.http.getData('HelpDeskQueries/formDepartmentWise').subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success) {
          this.departmentDetails = response.data || [];
        } else {
          this.departmentDetails = [];
        }
      },
      error: () => {
        this.dataloader = false;
        this.departmentDetails = [];
      }
    });
  }

  // open the offcanvas to show ticket details and allow status/assignee update
  openEnd(ticket: any) {
    if (!this.rbac.allowedToAccess('Support Helpdesk Queries Tab.update')) return;
    // Save current tab route
    localStorage.setItem('previousTab', this.router.url);
    localStorage.setItem("temselectdata", JSON.stringify(ticket));
    this.router.navigate(
      ['../teamqueries', ticket.id],
      { relativeTo: this.route }
    );
  }

  // get image url
  getImageUrl(imagePath: string): string | null {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  getProfileImage(imagePath: string): string | null {
    return this.getImageUrl(imagePath);
  }

  // get image url end
  isFormValid(): boolean {
    return (
      this.queriesdetailsForm?.get('status')?.value &&
      this.queriesdetailsForm?.get('priority')?.value &&
      this.queriesdetailsForm?.get('comment')?.value
    );
  }

  assigneeDetails(id: any) {
    this.selectedAssigneeId = id;
  }

  // update the query status end
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
