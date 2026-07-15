import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { InoDuepending } from './nodue-approval-details';
import { NodueDetailsPipe } from '../../../Pipes/nodue-details.pipe';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { environment } from '../../../../environments/environment';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-nodue-approval-details',
  imports: [
    CommonModule,
    TranslateModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    NoDataFoundComponent,
    NodueDetailsPipe,
    DateformatPipe,
    DataLoaderContentComponent,
    InfoIconComponent,
    TableModule
  ],
  templateUrl: './nodue-approval-details.component.html',
  styleUrl: './nodue-approval-details.component.scss',
})
export class NodueApprovalDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('nodueTable') nodueTable!: Table;
  subscription!: Subscription;
  searchValue: any;
  LOGIN: any;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  loading = false;
  nodue_Request_data = new BehaviorSubject<InoDuepending[]>([]);
  originalNodueData = [] as InoDuepending[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  AcceptForm!: FormGroup;
  rejectForm!: FormGroup;
  isLoading = false;
  selectedNoDueData = {} as any;
  selectedLeaveStatus: any;
  totalCount: any;

  constructor(
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    private signalService: SignalsService,
    private http: HttpService,
    private authService: AuthService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
  ) {}

  ngOnInit(): void {
    this.formInializer();
    this.getAllPendingApprovalsNoDue();
  }
onStatusApproveSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'approved') {
    this.AcceptForm.get('AcceptReason')?.setValue('Approved');
  }
}

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.rejectForm.get('notes')?.setValue('Rejected');
    }
  }
  //function to initalize the form
  formInializer() {
    this.AcceptForm = this.fb.group({
      AcceptReason: [
        null,
        [
          Validators.required,
          Validators.maxLength(250)
          
        ],
      ],
    });
     this.AcceptForm.get('AcceptReason')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
    this.rejectForm = this.fb.group({
      notes: [
        null,
        [
          Validators.required,
          Validators.maxLength(250)
          
        ],
      ],
    });
     this.rejectForm.get('notes')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
  }

  getAllPendingApprovalsNoDue() {
    this.loading = true;
    let loggedInuser = this.authService.getToken();
    const EmployeeId = loggedInuser.employeeId;
    this.subscription = this.http
      .getData(
        `NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`
      )
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.nodue_Request_data.next(data);
          this.originalNodueData = [...data]; // Store original data
        },
      });
  }

  getFilteredAndSortedNodue(): InoDuepending[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let nodueData = this.nodue_Request_data.getValue() ?? [];

    if (search) {
      nodueData = nodueData.filter(item =>
        item.employeeName?.toLowerCase().includes(search) ||
        item.employeeFusionEmpId?.toLowerCase().includes(search) ||
        item.departmentName?.toLowerCase().includes(search) ||
        item.status?.toLowerCase().includes(search) ||
        item.requiredEmails?.toLowerCase().includes(search)
      );
    }

    return nodueData;
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.nodue_Request_data.next([...this.originalNodueData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.nodueTable) {
          this.nodueTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle specific field mappings
      switch (field) {
        case 'employeeFusionEmpId':
          val1 = a.employeeFusionEmpId;
          val2 = b.employeeFusionEmpId;
          break;
        case 'employeeName':
          val1 = a.employeeName;
          val2 = b.employeeName;
          break;
        case 'requestedDate':
          val1 = a.requestedDate;
          val2 = b.requestedDate;
          break;
        case 'departmentName':
          val1 = a.departmentName;
          val2 = b.departmentName;
          break;
        case 'status':
          val1 = a.status;
          val2 = b.status;
          break;
        default:
          val1 = a[field];
          val2 = b[field];
      }

      // Handle date sorting
      if (field === 'requestedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle Employee ID sorting (alphanumeric)
      if (field === 'employeeFusionEmpId') {
        return event.order * String(val1 ?? '').localeCompare(
          String(val2 ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  openModal(Values: any, content: any) {
    this.selectedNoDueData = Values;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openModals(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  resetForm() {
    this.AcceptForm.reset();
    this.modalService.dismissAll();
  }

  close() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }
  //function to accept the nodue
  handleAccept() {
    this.isLoading = true;
    const date = moment();
    let loggedInuser = this.authService.getToken();
    (this.selectedNoDueData.status = 'Approved'),
      (this.selectedNoDueData.processedBy = loggedInuser.employeeId),
      (this.selectedNoDueData.processdByFusionEmpId = loggedInuser.fusionEmpId);
    this.selectedNoDueData.processedDate = date;
    this.selectedNoDueData.processedByName = `${loggedInuser.firstName ?? ''} ${
      loggedInuser.middleName ?? ''
    } ${loggedInuser.lastName ?? ''}`;
    this.selectedNoDueData.comments =
      this.AcceptForm.get('AcceptReason')?.value;
    this.subscription = this.http
      .postdata(
        `NoDueClearanceForm/pendingApprovalsUpdate`,
        this.selectedNoDueData
      )
      .subscribe({
        next: (respone: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.AcceptForm.reset();
          this.signalService.noDueTriggerSignal.set(true);
          this.signalService.noDueSideNavCountTriggerSignal.set(true);
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            nodue: true,
          }));
          this.conformationPopup.openSuccessModal(
            'No Due request approved successfully'
          );
          this.getAllPendingApprovalsNoDue();
          this.getApprovalStatusCounts();
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
          this.signalService.noDueTriggerSignal.set(true);
          this.signalService.noDueSideNavCountTriggerSignal.set(true);
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            nodue: true,
          }));
        },
      });
  }
 getApprovalStatusCounts() {
      let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }
  //function to reject the nodue
  rejectNodue() {

    this.isLoading = true;
    const date = moment();
    let loggedInuser = this.authService.getToken();
    (this.selectedNoDueData.status = 'Rejected'),
      (this.selectedNoDueData.processedBy = loggedInuser.employeeId),
      (this.selectedNoDueData.comments = this.rejectForm.get('notes')?.value),
      (this.selectedNoDueData.processdByFusionEmpId = loggedInuser.fusionEmpId);
    this.selectedNoDueData.processedDate = date;
    this.selectedNoDueData.processedByName = `${loggedInuser.firstName ?? ''} ${
      loggedInuser.middleName ?? ''
    } ${loggedInuser.lastName ?? ''}`;
    // this.selectedNoDueData.comments = this.AcceptForm.get('notes')?.value;
    this.subscription = this.http
      .postdata(
        `NoDueClearanceForm/pendingApprovalsUpdate`,
        this.selectedNoDueData
      )
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.rejectForm.reset();
          this.signalService.noDueTriggerSignal.set(true);
          this.signalService.noDueSideNavCountTriggerSignal.set(true);

          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            nodue: true,
          }));
          this.conformationPopup.openSuccessModal(
            'No Due request rejected successfully'
          );
          this.getAllPendingApprovalsNoDue();
           this.getApprovalStatusCounts();
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openSuccessModal(reason.error.message);
          this.signalService.noDueTriggerSignal.set(true);
          this.signalService.noDueSideNavCountTriggerSignal.set(true);
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            nodue: true,
          }));
        },
      });
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}