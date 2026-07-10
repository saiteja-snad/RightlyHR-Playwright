import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { SettingsUpdateIconComponent } from "../../icons/settings-update-icon/settings-update-icon.component";
import { HelpdeskPipe } from '../../Pipes/helpdesk.pipe';
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { environment } from '../../../environments/environment';
import { Paginator } from "primeng/paginator";
import { HelpdeskStatusUpdate } from '../helpdesk-model';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-helpdesk-reject-tickets',
  imports: [CommonModule, RouterModule, Select, NgbPopoverModule, NoDataFoundComponent, FormsModule, ReactiveFormsModule, HelpdeskPipe, DateformatPipe, TranslateModule, DataLoaderContentComponent, SettingsUpdateIconComponent, ProfileIconComponent, InfoIconComponent, Paginator, TableModule],
  templateUrl: './helpdesk-reject-tickets.component.html',
  styleUrl: './helpdesk-reject-tickets.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HelpdeskRejectTicketsComponent {
  @ViewChild('dt') dt!: Table;
  subscription!: Subscription;
  searchValue!: string;
  empinfo = {} as Ipersonal;
  tickets: any;
  isLoading: boolean = false;
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
  queriesdetailsForm!: FormGroup;
  selectedAssigneeId: any;
  dataloader: boolean = false;
  editableStatus: string = '';
  editableAssignee: number | null = null;
  selectedTicket: any;
  departmentDetails: any[] = [];
  allAssigneeEmployees: any[] = [];
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  searchSubject = new Subject<string>();
  destroy$ = new Subject<boolean>();
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
  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getemployedeshdata();
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
      this.getemployedeshdata(this.page, this.pageSize);
    });

  }
  // get deparment all
  getDepartment() {
    this.dataloader = true;
    this.subscription = this.http.getData('HelpDeskQueries/formDepartmentWise')
      .subscribe({
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
  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getemployedeshdata(this.page, this.pageSize);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getemployedeshdata(this.page, this.pageSize);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getemployedeshdata(this.page, this.pageSize);

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
      this.getemployedeshdata();
      return;
    }

    if (this.sortField === nextField && this.sortOrder === nextOrder) return;

    this.sortField = nextField;
    this.sortOrder = nextOrder;
    this.tableSortField = field;
    this.tableSortOrder = event.order;
    this.page = 1;
    this.first = 0;
    this.getemployedeshdata();
  }

  // open offcanvas with selected ticket details and department-wise assignee list
  // openEnd(content: any, ticket: any) {

  //   this.selectedTicket = { ...ticket };

  //   this.queriesdetailsForm.patchValue({
  //   assigneeId: ticket.assigneeId || null,
  //   status: ticket.status || null,
  //   priority: ticket.priority || null,
  //   comment: ''
  // });

  //   // separate editable values
  //   this.editableStatus = ticket.status;
  //   this.editableAssignee = ticket.assignedTo;
  //   // Find matching department
  //   const matchedDept = this.departmentDetails.find(dept => dept.departmentName?.trim().toLowerCase() === this.selectedTicket.department?.trim().toLowerCase());
  //   if (matchedDept && Array.isArray(matchedDept.employees)) {
  //     this.allAssigneeEmployees = matchedDept.employees.map((emp: any) => ({
  //       assigneeId: emp.employeeId,
  //       fullName: `${emp.fusionEmpId || ''} - ${emp.employeeName}`.trim()
  //     }));

  //   } else {
  //     this.allAssigneeEmployees = [];
  //   }
  //   this.offcanvasService.open(content, { position: 'end' });
  // }

  openEnd(ticket: any) {
    if (!this.rbac.allowedToAccess('Support Helpdesk Queries Tab.update')) return;
    // ✅ Save current tab route
    localStorage.setItem('previousTab', this.router.url);
    localStorage.setItem("temselectdata", JSON.stringify(ticket));
    this.router.navigate(
      ['../teamqueries', ticket.id],
      { relativeTo: this.route }
    );
  }
  // get image to show profile
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
  // modify the status and assignee of the ticket and submit the update to backend
  // helpdesk table data


    onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  getemployedeshdata(page?: number, pageSize?: number) {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    let url = `HelpDeskQueries/AssignedTo/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}&status=rejected`;
    const sortQuery = this.sortField && this.sortOrder ? `&Sorts=${this.sortField}:${this.sortOrder}` : '';

    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${this.searchValue}`;
    }
    url += sortQuery;
    this.subscription = this.http.getData(url).subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success && response.data) {
          this.tickets = response.data.data
          this.collectionSize = response.data.totalRejected;
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

  isFormValid(): boolean {
    return (
      this.queriesdetailsForm?.get('status')?.value &&
      this.queriesdetailsForm?.get('priority')?.value &&
      this.queriesdetailsForm?.get('comment')?.value
    );
  }
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
  }

  assigneeDetails(id: any) {
    this.selectedAssigneeId = id;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
