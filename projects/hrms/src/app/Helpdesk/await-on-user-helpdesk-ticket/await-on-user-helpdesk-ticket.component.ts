import { Component, OnDestroy, OnInit } from '@angular/core';
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
  selector: 'app-await-on-user-helpdesk-ticket',
  imports: [CommonModule, Select, RouterModule, NgbPopoverModule, NoDataFoundComponent, FormsModule, TranslateModule, ReactiveFormsModule, ItsupportPipe, DateformatPipe, DataLoaderContentComponent, SettingsUpdateIconComponent, ProfileIconComponent, InfoIconComponent, HelpdeskPipe, Paginator],
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
  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
    private offcanvasService: NgbOffcanvas,
    private confirmation: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private route: ActivatedRoute
  ) { }

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

  // get help desk ticket data
  getuserticketsbyempid(page?: number, pageSize?: number) {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);

    let url = `HelpDeskQueries/AssignedTo/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}&status=Await On User`;
    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${this.searchValue}`;
    }
    this.subscription = this.http.getData(url).subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success && response.data) {
          this.tickets = response.data.data || [];
          this.collectionSize = response.data.totalAwaitOnUser;
          console.log("Await On User tickets:", this.tickets);

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
