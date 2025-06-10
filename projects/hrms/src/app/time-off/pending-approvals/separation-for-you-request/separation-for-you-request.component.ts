import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ISeparation, ISeparationRequest } from './separation-for-you-request';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import { environment } from '../../../../environments/environment';
import { RbacService } from '../../../services/rbac.service';
import { PendingapprovalsseparationPipe } from "../../../Pipes/pendingapprovalsseparation.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-separation-for-you-request',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    ReactiveFormsModule,
    PendingapprovalsseparationPipe,
    DataLoaderContentComponent,
    InfoIconComponent
],
  templateUrl: './separation-for-you-request.component.html',
  styleUrl: './separation-for-you-request.component.scss',
})

export class SeparationForYouRequestComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  searchValue!: string;
  separation_For_You_Details = new BehaviorSubject<ISeparation[]>([]);
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  isDataLoader = false;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedSpRequestData: any = {
    noticperiodType: null,
    extend: false,
    discontinue: false,
    extenddate: null,
    trcomments: '', // Add a default value for trcomments
    rejectedReason: '',
    early: false,
    spsalaryhold: undefined
  };
  isLoading = false;
  regular = false;
  extend = false;
  early = false;
  buttondisable = false;
  selectedRadio = '';
  islastworking = true;
  lastworkingValidation = true;
  isempeffectivevaild = true;
  requesthandler = {} as any;
  selectedSpRequestDataforheader = {} as any;
  requestType!: string;
  empdata = {} as any;
  jsonData = {} as any;
  myApproverComments = {} as any;
  rejectForm!: FormGroup;
  @ViewChild('acceptForm') acceptForm!: NgForm;

  constructor(
    private authService: AuthService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    private signalService: SignalsService,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService
  ) { }

  ngOnInit(): void {
    this.initializeRejectForm();
    this.getseparationforyourequests();
  }

  closepopup(content: any) {
    // this.isCheckBoxEnabledRegular = false;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  initializeRejectForm() {
    this.rejectForm = this.fb.group({
      notes: [this.selectedSpRequestData?.rejectedReason || '', Validators.required]
    });
  }

  rejectpopup() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }

  resetForm(f: NgForm) {
    f.resetForm(); // resets form state AND ngModel bindings
    // Clear the selected data structure completely and set defaults
    this.selectedSpRequestData = {
      spIsAcceptEarlyrelievingcheck: false,
      spMangerEarlyreliveingDate: null,
      spearlyReliveingDate: null,
      comments: '',
      extenddate: null,
      spRequestAppliedDate: null,
      spRequestLastWorkingDate: null,
      spIsEarlyRelieveing: false,
      spsalaryhold: undefined
      // Add any other keys your form uses here
    };
    // Reset condition flags
    this.regular = false;
    this.early = false;
    this.extend = false;
    // Close the modal
    this.modalService.dismissAll();
  }

  //function to get the separation request based on the for you
  getseparationforyourequests() {
    this.isDataLoader = true
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    let moduleId = environment.SeparationrequestmoduleId
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=EMP`
      )
      .subscribe({
        next: (data: any) => {

          this.separation_For_You_Details.next(
            data.data.filter(
              (item: any) =>
                item.approvalHeader.status != 'Processed' &&
                item.approvalHeader.status != 'Rejected' &&
                item.approvalHeader.status != 'Withdrawn'
            )
          );
          this.isDataLoader = false;
        },
        error: (reason) => console.log(reason),
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', });
  }

  openModalLarge(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static', });
  }

  openModalXLarge(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static', });
  }

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

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  //function to format the date
  formatDate(date: any) {
    return date?.split('T')[0];
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }

  //function to get the requried data
  handleRequest(request: ISeparationRequest) {
    this.regular = false;
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
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        //console.log(data);
        this.empdata = data as Ipersonal;
        this.empdata.dateOfJoining = this.formatDate(this.empdata.dateOfJoining);
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal(err.error.message);
      },
    });
  }

  extendCondition(value: any) {
    if (value == true) {
      this.selectedSpRequestData.spExtendedDate = null;
    }
  }

  handleAccept(f: NgForm) {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    // submit logic
    if (this.selectedSpRequestData.requestSelectedType == 'Regular') {
      this.jsonData = JSON.stringify({
        splastworkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Approved',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Early') {
      this.jsonData = JSON.stringify({
        spearlyReliveingDate:
          this.selectedSpRequestData.spMangerEarlyreliveingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Approved',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        spExtendedDate: this.selectedSpRequestData.extenddate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Extend',
      });
    }
    let requestBody = {
      status: 'Approved',
      comments: this.selectedSpRequestData.comments,
      isAcceptEarly: this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck ?? false,
      lastWorkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
      earlyRelievingDate: this.selectedSpRequestData.spMangerEarlyreliveingDate,
      extendedDate: this.selectedSpRequestData.extenddate,
      meta: this.jsonData,
      approvedBy: loggedInUser.employeeId.toString(),
      currentStage: parseInt(this.requesthandler.approvalHeader.currentapprovalStage),
    };
    this.subscription = this.http.putData(`PendingApproval/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.isLoading = false;
        this.regular = true;
        this.early = false;
        this.extend = false;
        this.selectedRadio = '';

        this.modalService.dismissAll();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: true,
        }));
        if (this.requestType === 'Separation Request') {
          this.conformationPopup.openSuccessModal(
            'Separation Request Approved Successfully'
          );
        } else if (this.requestType === 'Early Relieving Request') {
          this.conformationPopup.openSuccessModal(
            'Early Relieving Request Approved Successfully'
          );
        } else {
          this.conformationPopup.openSuccessModal(
            'Separation Request Approved Successfully'
          );
        }
        this.getseparationforyourequests();
        this.acceptForm.resetForm();
        this.signalService.separationForYouTriggerSignal.set(true);
        this.signalService.separationForRoleTriggerSignal.set(true);
        this.signalService.separationSidNavCountTriggerSignal.set(true);

      },
      error: (reason: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(reason.error.message);
      },
      complete: () => {
        this.isLoading = false;
        f.resetForm();
      },
    });
  }
  //function to send the rejected status and comments

  handleReject(f: FormGroup) {
    this.isLoading = true;
    this.jsonData = JSON.stringify({
      status: 'Rejected',
    });
    let loginuserdata = this.authService.getToken();
    let requestBody = {
      status: 'Rejected',
      comments: f.value.notes,
      approvedBy: loginuserdata.employeeId.toString(),
      meta: this.jsonData,
      currentStage: parseInt(this.requesthandler.approvalHeader.currentapprovalStage),
    };
    this.subscription = this.http.putData(`PendingApproval/${this.requesthandler.approvalHeader?.id}`, requestBody).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.modalService.dismissAll();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: true,
        }));
        if (this.requestType === 'Separation Request') {
          this.conformationPopup.openSuccessModal(
            'Separation Request Rejected Successfully'
          );
        } else if (this.requestType === 'Early Relieving Request') {
          this.conformationPopup.openSuccessModal(
            'Early Relieving Request Rejected Successfully'
          );
        } else {
          this.conformationPopup.openSuccessModal(
            'Separation Request Rejected Successfully'
          );
        }
        this.getseparationforyourequests();
        this.signalService.separationForYouTriggerSignal.set(true);
        this.signalService.separationForRoleTriggerSignal.set(true);
        this.signalService.separationSidNavCountTriggerSignal.set(true);
      },

      error: (reason: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(reason.error.message);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  handleProcess(f: NgForm) {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    if (this.selectedSpRequestData.requestSelectedType == 'Regular') {
      this.jsonData = JSON.stringify({
        splastworkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Processed',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Early') {
      this.jsonData = JSON.stringify({
        spearlyReliveingDate:
          this.selectedSpRequestData.spMangerEarlyreliveingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Processed',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        spExtendedDate: this.selectedSpRequestData.extenddate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Processed',
      });
    }
    let requestBody: any = {
      status: 'Processed',
      comments: this.selectedSpRequestData.comments,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyRelieving ?? false,
      noticePeriodType: this.selectedSpRequestData.noticperiodType,
      noticePeriodTypeDays: this.selectedSpRequestData.noticperioddays,
      salaryhold: this.selectedSpRequestData.spsalaryhold,
      meta: this.jsonData,
      approvedBy: loggedInUser.employeeId.toString(),
      currentStage: parseInt(this.requesthandler.approvalHeader.currentapprovalStage),
    };
    if (this.selectedSpRequestData.requestSelectedType == 'Regular') {
      requestBody.lastWorkingDate =
        this.selectedSpRequestData.spRequestLastWorkingDate;
      requestBody.isAcceptEarly = false;
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Early') {
      requestBody.earlyRelievingDate =
        this.selectedSpRequestData.spMangerEarlyreliveingDate;
      requestBody.isAcceptEarly = true;
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Extend') {
      requestBody.extendedDate = this.selectedSpRequestData.extenddate;
      requestBody.isAcceptEarly = false;
    }
    this.subscription = this.http.putData(`PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
      requestBody).subscribe({
        next: (respone: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.getseparationforyourequests();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            separation: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Separation Request Processed Successfully'
          );
          this.signalService.separationForYouTriggerSignal.set(true);
          this.signalService.separationForRoleTriggerSignal.set(true);
          this.signalService.separationSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  getBlockedPastDate(date: string): string {
    const currentDateObj = moment(date).startOf('day'); // Set time to start of day (midnight)
    // Format the date as "YYYY-MM-DD"
    const formattedDate = currentDateObj.format('YYYY-MM-DD');
    return formattedDate;
  }

  getBlockedFutureDate(lastWorkingDate: string): string {
    const lastWorkingDateObj = moment(lastWorkingDate).startOf('day'); // Set time to start of day (midnight)
    // Format the date as "YYYY-MM-DD"
    const formattedDate = lastWorkingDateObj.format('YYYY-MM-DD');
    return formattedDate;
  }

  isCheckBoxEnabledEarly = false;
  toggleEarly() {
    if (!this.early) {
      if (this.selectedSpRequestData.spIsEarlyRelieveing == true) {
        this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = true;
        this.selectedSpRequestData.isAcceptEarlyRequest = 'Yes';
      } else {
        this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
      }
      this.selectedSpRequestData.requestSelectedType = 'Early';
      this.regular = false;
      this.extend = false;
      this.early = true;
      this.buttondisable = true;
      this.isCheckBoxEnabledEarly = true;
      // Clear data related to Extend and Discontinue
      this.clearExtendData();
      this.clearDiscontinueData();
    }
    else {
      if (!this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck) {
        this.early = true;
      }
      else {
        // Toggle off Early Relieving
        this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
        this.early = false;
        this.selectedRadio = ''
        this.buttondisable = false;
        this.clearEarlyData();
      }

    }
  }

  earlyrelieving() {
    if (!this.early) {
      if (this.selectedSpRequestData.spIsEarlyRelieveing == true) {
        this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = true;
        this.selectedSpRequestData.isAcceptEarlyRequest = 'Yes';
      } else {
        this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
      }
      // this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
      this.selectedSpRequestData.requestSelectedType = 'Early';
      this.regular = false;
      this.extend = false;
      this.early = true;
      this.buttondisable = true;
      this.isCheckBoxEnabledEarly = true;
      // Clear data related to Extend and Discontinue
      this.clearExtendData();
      this.clearDiscontinueData();
    } else {
      if (!this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck) {
        this.early = true;
      }
      else {
        // Toggle off Early Relieving
        this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
        this.early = false;
        this.selectedRadio = ''
        this.buttondisable = false;
        this.clearEarlyData();
      }
    }
  }

  isCheckBoxEnabledRegular = false
  toggleRegular() {
    this.selectedSpRequestData.spIsAcceptEarlyRelievingcheck = false;
    this.selectedSpRequestData.requestSelectedType = 'Regular';
    this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
    this.extend = false;
    this.early = false;
    this.regular = true;
    this.buttondisable = true;
    this.selectedRadio = '';
    this.isCheckBoxEnabledRegular = true;
    // Clear data related to Early Relieving and Extend
    this.clearEarlyData();
    this.clearExtendData();
  }

  isCheckBoxEnabledExtended = false;
  toggleExtend() {
    this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
    this.selectedSpRequestData.requestSelectedType = 'Extend';
    this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
    this.isCheckBoxEnabledExtended = true;
    this.regular = false;
    this.early = false;
    this.extend = true;
    this.buttondisable = true;
    this.selectedRadio = '';
    // Clear data related to Early Relieving and Discontinue
    this.clearEarlyData();
    this.clearDiscontinueData();
  }

  // Function to clear data related to Early Relieving
  clearEarlyData() {
    this.selectedSpRequestData.earlyRelievingDate = null;
    this.selectedSpRequestData.comments = '';
  }

  // Function to clear data related to Extend
  clearExtendData() {
    this.selectedSpRequestData.extenddate = null;
    this.selectedSpRequestData.comments = ''; // Assuming comments is used for Extend
    this.selectedSpRequestData.reasonForExtend = '';
  }

  // Function to clear data related to Discontinue
  clearDiscontinueData() {
    this.selectedSpRequestData.rejectedReason = '';
  }

  earlyRelievingValidationCheck() {

    if (this.selectedSpRequestData.spMangerEarlyreliveingDate !=
      this.selectedSpRequestData.spearlyReliveingDate) {
      this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
      this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
      this.selectedRadio = 'early';
      this.selectedSpRequestData.requestSelectedType = 'Early';
    }
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}