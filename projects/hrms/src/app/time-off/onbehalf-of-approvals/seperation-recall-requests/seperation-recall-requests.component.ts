import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { PendingapprovalsseparationPipe } from '../../../Pipes/pendingapprovalsseparation.pipe';
import { AuthService } from '../../../services/auth.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { ISeparation, ISeparationRequest } from '../../pending-approvals/separation-for-you-request/separation-for-you-request';

@Component({
  selector: 'app-seperation-recall-requests',
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
  ],
  templateUrl: './seperation-recall-requests.component.html',
  styleUrl: './seperation-recall-requests.component.scss'
})
export class SeperationRecallRequestsComponent implements OnInit, OnDestroy {
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
  totalCount:any;
   LOGIN: any;
  constructor(
    private authService: AuthService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public rbac: RbacService,
    private signalService: SignalsService,
    public formsValidation: FormValidationsService,
  ) {
    // React to trigger signal from shared service
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovals();
        } else {
          this.recall_For_You_Details.next([]);
        }
        this.http.resetTriggerSignal();
      }
    });
  }

  ngOnInit(): void {
    this.formInializer();
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      this.getAllPendingApprovals();
    } else {
      this.recall_For_You_Details.next([]);;
    }
  }
onStatusApproveSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'approved') {
    this.recallAcceptForm.get('AcceptReason')?.setValue('Approved');
  }
}

onStatusProcessSelect(status: string) {
  this.selectedLeaveStatus = status;

  if (status === 'processed') {
    this.recallAcceptFormForProcess.get('recallReason')?.setValue('Processed');
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
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    let moduleId = environment.RecallrequestmoduleId;
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}`
      )
      .subscribe({
        next: (data: any) => {
          this.recall_For_You_Details.next(
            data.data.filter(
              (item: any) =>
                item.approvalHeader.status != 'Processed' &&
                item.approvalHeader.status != 'Rejected'
            )
          );
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
      onBehalfOfApproval: true,
      approvedPersonaType: 'onBehalfOf',
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
      onBehalfOfApproval: true,
      approvedPersonaType: 'onBehalfOf',
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
      onBehalfOfApproval: true,
      approvedPersonaType: 'onBehalfOf',
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
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}