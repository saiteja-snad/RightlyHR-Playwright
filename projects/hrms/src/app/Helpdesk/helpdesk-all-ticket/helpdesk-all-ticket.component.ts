import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import {
  NgbModal,
  NgbOffcanvas,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IDepartment } from '../../Interfaces/letters-model';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../services/open-modal.service';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from '../../Pipes/itsupport.pipe';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { SettingsUpdateIconComponent } from '../../icons/settings-update-icon/settings-update-icon.component';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { HelpdeskPipe } from '../../Pipes/helpdesk.pipe';
import { environment } from '../../../environments/environment';
import { Paginator } from 'primeng/paginator';
import { HelpdeskStatusUpdate } from '../helpdesk-model';
import { LocalStorage } from '@azure/msal-browser';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-helpdesk-all-ticket',
  imports: [
    CommonModule,
    Select,
    RouterModule,
    NgbPopoverModule,
    NoDataFoundComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ItsupportPipe,
    DateformatPipe,
    DataLoaderContentComponent,
    SettingsUpdateIconComponent,
    ProfileIconComponent,
    InfoIconComponent,
    HelpdeskPipe,
    Paginator,
    TableModule,
  ],
  templateUrl: './helpdesk-all-ticket.component.html',
  styleUrl: './helpdesk-all-ticket.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HelpdeskAllTicketComponent {
  @ViewChild('dt') dt!: Table;
  subscription!: Subscription;
  searchValue!: string;
  empinfo = {} as Ipersonal;
  tickets: any;
  queriesdetailsForm!: FormGroup;
  dataloading: boolean = false;
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' },
  ];
  priorityDetails = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
  ];
  allAssigneeEmployees = [] as Assignee[];
  selectedAssigneeId: any;
  dataloader: boolean = false;
  selectedTicket: any;
  editableStatus: string = '';
  editableAssignee: number | null = null;
  departmentDetails: any[] = [];
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  searchSubject = new Subject<string>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
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
  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private confirmation: OpenModalService,
    private offcanvasService: NgbOffcanvas,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getemployedeshdata();
    this.getDepartment();
    this.queriesdetailsForm = this.fb.group({
      assigneeId: [null],
      status: [null, Validators.required],
      priority: [null, Validators.required],
      comment: ['', [Validators.required, Validators.maxLength(100)]],
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

  // get the department-wise employees to show in assignee dropdown
  getDepartment() {
    this.subscription = this.http
      .getData('HelpDeskQueries/formDepartmentWise')
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.departmentDetails = response.data || [];
          } else {
            this.departmentDetails = [];
          }
        },
        error: () => {
          this.departmentDetails = [];
        },
      });
  }
  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
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

  // open offcanvas to show ticket details and edit options
  openEnd(ticket: any) {
    if (!this.rbac.allowedToAccess('Support Helpdesk Queries Tab.update')) return;
    // Save current tab route
    localStorage.setItem('previousTab', this.router.url);
    localStorage.setItem('temselectdata', JSON.stringify(ticket));
    this.router.navigate(['../teamqueries', ticket.id], {
      relativeTo: this.route,
    });
  }
  // get image url for profile
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

  // get helpdesk tickets assigned to the employee
  getemployedeshdata(page?: number, pageSize?: number) {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.dataloader = true;
    let url = `HelpDeskQueries/AssignedTo/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}`;
    const sortQuery = this.sortField && this.sortOrder ? `&Sorts=${this.sortField}:${this.sortOrder}` : '';
    if (this.searchValue) {
      url += `&search=${this.searchValue}`;
    }
    url += sortQuery;
    this.subscription = this.http
      .getData(url)
      .subscribe({
        next: (response: any) => {


          if (response.success) {
            this.tickets = response.data.data;
            this.collectionSize = response.data.totalCount;

          } else {
            this.tickets = [];
          }
          this.dataloader = false;
        },
        error: (err: any) => {
          this.dataloader = false;
          console.log(err);
          this.tickets = [];
        },
      });
  }

  // update the modify status
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

  cleardata() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
