import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ISeparation, ISeparationRequest } from '../separation-for-you-request/separation-for-you-request';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { environment } from '../../../../environments/environment';
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { PendingapprovalsseparationPipe } from "../../../Pipes/pendingapprovalsseparation.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-recall-for-you-request',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    PendingapprovalsseparationPipe,
    DataLoaderContentComponent,
    InfoIconComponent,
    TableModule,
  ],
  templateUrl: './recall-for-you-request.component.html',
  styleUrl: './recall-for-you-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RecallForYouRequestComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  searchValue!: string;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  isDataLoader = false;
  recall_For_You_Details = new BehaviorSubject<ISeparation[]>([]);
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  myApproverComments = {} as any;
  requesthandler = {} as any;
  selectedSpRequestDataforheader = {} as any;
  selectedSpRequestData = {} as any;
  requestType!: string;
  empdata = {} as any;
  isLoading = false;
  jsonData = {} as any;
  recallAcceptFormForProcess!: FormGroup;
  recallAcceptForm!: FormGroup;
  rejectSeparationForm!: FormGroup;
  selectedLeaveStatus: any;
  totalCount: any;
  @ViewChild('recallTable') recallTable!: Table;
  originalRecallData = [] as ISeparation[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(
    private authService: AuthService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public rbac: RbacService,
    private signalService: SignalsService,
    public formsValidation: FormValidationsService,
  ) {}

  ngOnInit(): void {
    this.formInializer();
    this.getAllPendingApprovals();
  }
onStatusApproveSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'approved') {
    this.recallAcceptForm.get('AcceptReason')?.setValue('Approved');
  }
}

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.rejectSeparationForm.get('notes')?.setValue('Rejected');
    }
  }
  //function to initalize the form
  formInializer() {
    this.recallAcceptFormForProcess = this.fb.group({
      recallReason: [
        null,
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
     this.recallAcceptFormForProcess.get('recallReason')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
    this.recallAcceptForm = this.fb.group({
      AcceptReason: [
        null,
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
    this.rejectSeparationForm = this.fb.group({
      notes: [
        null,
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
     this.rejectSeparationForm.get('notes')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
  }

  //function to open the modal
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openModalXLarge(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }
  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  resetForm() {
    this.recallAcceptForm.reset();
    this.modalService.dismissAll();
  }

  close() {
    this.rejectSeparationForm.reset();
    this.modalService.dismissAll();
  }

  //function to get the leaves by employee id
  getAllPendingApprovals() {
    this.isDataLoader = true;
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    let moduleId = environment.RecallrequestmoduleId;
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=EMP`
      )
      .subscribe({
        next: (data: any) => {
          const filteredData = data.data.filter(
            (item: any) =>
              item.approvalHeader.status != 'Processed' &&
              item.approvalHeader.status != 'Rejected'
          );
          this.recall_For_You_Details.next(filteredData);
          this.originalRecallData = [...filteredData]; // Store original data
          this.isDataLoader = false;
        },
        error: (reason) => console.log(reason),
      });
  }

  //function to get the approver comments
  approverCommentsfunction(value: any) {
    this.myApproverComments = value.map((ele: any) => {
      // Parse the metaData and assign it to metadata property
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele, // Copy other properties from ele
        metadata: parsedMetaData, // Assign parsed metaData to metadata property
      };
    });
  }

  //function to handle the approved request  and comments
  handleRequest(request: ISeparationRequest) {
    this.requesthandler = request;
    this.selectedSpRequestData = request.entity;
    this.selectedSpRequestData.noticperiodType = null;
    this.selectedSpRequestDataforheader = request.approvalHeader;
    this.selectedSpRequestData.spRequestLastWorkingDate = this.formatDate(
      this.selectedSpRequestData.spRequestLastWorkingDate
    );
    this.selectedSpRequestData.spMangerEarlyreliveingDate = this.formatDate(
      this.selectedSpRequestData.spearlyReliveingDate
    );
    this.selectedSpRequestData.spExtendedDate = this.formatDate(
      this.selectedSpRequestData.spExtendedDate
    );
    this.getEmployeedatabyid(this.selectedSpRequestData);
    if (
      this.selectedSpRequestData.sprecalledStatus.toLowerCase() == 'separation'
    ) {
      this.requestType = 'Separation Request';
    } else if (
      this.selectedSpRequestData.sprecalledStatus.toLowerCase() ==
      'earlyrelieving'
    ) {
      this.requestType = 'Early Relieving Request';
    }
  }

  //function to get the employeedata
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.spRequestEmployeeId;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.empdata = data as Ipersonal;
          this.empdata.dateOfJoining = this.formatDate(
            this.empdata.dateOfJoining
          );
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal(err.error.message);
        },
      });
  }

  //function to format the date
  formatDate(date: any) {
    return date?.split('T')[0];
  }

  handleAccept() {
    let loggedinuser = this.authService.getToken();
    this.isLoading = true;
    this.jsonData = JSON.stringify({ status: 'Approved' });
    let requestBody = {
      status: 'Approved',
      comments: this.recallAcceptForm.get('AcceptReason')?.value,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyRelieving ?? false,
      lastWorkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
      meta: this.jsonData,
      approvedBy: loggedinuser.employeeId.toString(),
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };
    this.subscription = this.http
      .putData(
        `PendingApproval/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.isLoading = false;
          this.recallAcceptForm.reset();
          this.modalService.dismissAll();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            recall: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Recall request approved successfully'
          );
          this.getAllPendingApprovals();
          this.signalService.recallSeparationForYouTriggerSignal.set(true);
          this.signalService.recallSeparationForRoleTriggerSignal.set(true);
          this.signalService.recallSeparationSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
            this.getApprovalStatusCounts();
        },
      });
  }

  handlerecallReject() {
    this.jsonData = JSON.stringify({
      status: 'Rejected',
    });
    let loginuserdata = this.authService.getToken();
    let requestBody = {
      status: 'Rejected',
      comments: this.rejectSeparationForm.get('notes')?.value,
      approvedBy: loginuserdata.employeeId.toString(),
      meta: this.jsonData,
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };
    this.subscription = this.http
      .putData(
        `PendingApproval/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (response: any) => {
          this.rejectSeparationForm.reset();
          this.modalService.dismissAll();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            recall: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Recall request rejected successfully'
          );
          this.getAllPendingApprovals();
          this.signalService.recallSeparationForYouTriggerSignal.set(true);
          this.signalService.recallSeparationForRoleTriggerSignal.set(true);
          this.signalService.recallSeparationSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
            this.getApprovalStatusCounts();
        },
      });
  }

  handlerecallProcess() {
    let loggedInUser = this.authService.getToken();
    this.isLoading = true;
    this.jsonData = JSON.stringify({
      status: 'Processed',
    });
    let requestBody: any = {
      status: 'Processed',
      comments: this.recallAcceptFormForProcess.get('recallReason')?.value,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyRelieving ?? false,
      lastWorkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
      meta: this.jsonData,
      approvedBy: loggedInUser.employeeId.toString(),
      currentStage: parseInt(
        this.requesthandler.approvalHeader.currentapprovalStage
      ),
    };
    if (this.selectedSpRequestData.spIsAcceptEarlyRelieving === true) {
      requestBody.lastWorkingDate =
        this.selectedSpRequestData.spearlyReliveingDate;
    }
    if (
      this.selectedSpRequestData.spIsAcceptEarlyRelieving === null ||
      this.selectedSpRequestData.spIsAcceptEarlyRelieving === '' ||
      this.selectedSpRequestData.spIsAcceptEarlyRelieving === false
    ) {
      requestBody.lastWorkingDate =
        this.selectedSpRequestData.spRequestLastWorkingDate;
    }
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.recallAcceptFormForProcess.reset();
          this.modalService.dismissAll();
          this.getAllPendingApprovals();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            recall: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Recall request processed successfully'
          );
          this.isLoading = false;
          this.signalService.recallSeparationForYouTriggerSignal.set(true);
          this.signalService.recallSeparationForRoleTriggerSignal.set(true);
          this.signalService.recallSeparationSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
          this.getApprovalStatusCounts();
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

  getFilteredAndSortedRecalls(): ISeparation[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let recalls = this.recall_For_You_Details.getValue() ?? [];

    if (search) {
      recalls = recalls.filter(item =>
        item.entity?.spRequesterName?.toLowerCase().includes(search) ||
        item.entity?.spRequestFusionEmployeeId?.toLowerCase().includes(search) ||
        item.entity?.spDepartment?.toLowerCase().includes(search) ||
        item.entity?.spTeam?.toLowerCase().includes(search) ||
        item.entity?.spDesignation?.toLowerCase().includes(search)
      );
    }

    return recalls;
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
        this.recall_For_You_Details.next([...this.originalRecallData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.recallTable) {
          this.recallTable.reset();
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
        case 'spRequesterName':
          val1 = a.entity?.spRequesterName;
          val2 = b.entity?.spRequesterName;
          break;
        case 'spRequestFusionEmployeeId':
          val1 = a.entity?.spRequestFusionEmployeeId;
          val2 = b.entity?.spRequestFusionEmployeeId;
          break;
        case 'spDepartment':
          val1 = a.entity?.spDepartment;
          val2 = b.entity?.spDepartment;
          break;
        case 'spTeam':
          val1 = a.entity?.spTeam;
          val2 = b.entity?.spTeam;
          break;
        case 'spDesignation':
          val1 = a.entity?.spDesignation;
          val2 = b.entity?.spDesignation;
          break;
        case 'spRequestAppliedDate':
          val1 = a.entity?.spRequestAppliedDate;
          val2 = b.entity?.spRequestAppliedDate;
          break;
        case 'spRequestLastWorkingDate':
          val1 = a.entity?.spRequestLastWorkingDate;
          val2 = b.entity?.spRequestLastWorkingDate;
          break;
        case 'spearlyReliveingDate':
          val1 = a.entity?.spearlyReliveingDate;
          val2 = b.entity?.spearlyReliveingDate;
          break;
        case 'sprecalledStatus':
          val1 = a.entity?.sprecalledStatus;
          val2 = b.entity?.sprecalledStatus;
          break;
        default:
          val1 = a[field];
          val2 = b[field];
      }

      // Handle date sorting
      if (field === 'spRequestAppliedDate' || field === 'spRequestLastWorkingDate' || field === 'spearlyReliveingDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle Employee ID sorting (alphanumeric)
      if (field === 'spRequestFusionEmployeeId') {
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
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}