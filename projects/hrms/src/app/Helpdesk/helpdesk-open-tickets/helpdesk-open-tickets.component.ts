import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { IDepartment } from '../../Interfaces/letters-model';
import { OpenModalService } from '../../services/open-modal.service';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { SettingsUpdateIconComponent } from "../../icons/settings-update-icon/settings-update-icon.component";
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { HelpdeskPipe } from "../../Pipes/helpdesk.pipe";
import { environment } from '../../../environments/environment';
import { Paginator } from "primeng/paginator";
import { HelpdeskStatusUpdate } from '../helpdesk-model';

@Component({
  selector: 'app-helpdesk-open-tickets',
  imports: [CommonModule, Select, RouterModule, NgbPopoverModule, NoDataFoundComponent, FormsModule, TranslateModule, ReactiveFormsModule, ItsupportPipe, DateformatPipe, DataLoaderContentComponent, SettingsUpdateIconComponent, ProfileIconComponent, InfoIconComponent, HelpdeskPipe, Paginator],
  templateUrl: './helpdesk-open-tickets.component.html',
  styleUrl: './helpdesk-open-tickets.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HelpdeskOpenTicketsComponent {
  subscription!: Subscription;
  searchValue!: string;
  empinfo = {} as Ipersonal;
  tickets: any;
  dataloading: boolean = false;
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
  selectedAssigneeId: any;
  dataloader: boolean = false;
  departmentDetails: any[] = [];
  allAssigneeEmployees = [] as Assignee[];
  selectedTicket: any;
  editableStatus: string = '';
  queriesdetailsForm!: FormGroup;
  editableAssignee: number | null = null;
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
  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
    private confirmation: OpenModalService,
    private offcanvasService: NgbOffcanvas,
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
  // open the offcanvas with selected ticket details and also set the editable values for status and assignee
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
  // get image to display profile
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

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  // help desk table data with department filter and only open tickets
  getemployedeshdata(page?: number, pageSize?: number) {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    let url = `HelpDeskQueries/AssignedTo/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}&status=open`;
    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${this.searchValue}`;
    }
    this.subscription = this.http.getData(url).subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success && response.data && response.data) {
          //  Show only OPEN tickets (case insensitive)
          this.tickets = response.data.data
          this.collectionSize = response.data.totalOpen;
        } else {
          this.tickets = [];
        }
      },
      error: (err: any) => {
        this.dataloader = false;
        console.log(err);
        this.tickets = [];
      }
    });
  }
  // modify the status and assignee of the ticket and submit the update to backend
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  isFormValid(): boolean {
    return (
      this.queriesdetailsForm?.get('status')?.value &&
      this.queriesdetailsForm?.get('priority')?.value &&
      this.queriesdetailsForm?.get('comment')?.value
    );
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

