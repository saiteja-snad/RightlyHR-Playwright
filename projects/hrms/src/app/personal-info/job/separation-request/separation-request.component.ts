import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Ipersonal, } from '../../../Interfaces/personal-modal';
import moment from 'moment';
import { OpenModalService } from '../../../services/open-modal.service';
import { ISeparation } from './separation-request';
import { environment } from '../../../../environments/environment';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { RaiseseparationComponent } from '../raiseseparation/raiseseparation.component';
import { AuthService } from '../../../services/auth.service';
import { SeparationSubTabsComponent } from "../../../shared/personalinfo-tabs/separation-sub-tabs/separation-sub-tabs.component";
import { MyinfoSeparationSubTabsComponent } from "../../../shared/myinfo-tabs/myinfo-separation-sub-tabs/myinfo-separation-sub-tabs.component";
@Component({
  selector: 'app-separation-request',
  imports: [
    CommonModule,
    TranslateModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NgxDocViewerModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    InfoIconComponent,
    SeparationSubTabsComponent,
    MyinfoSeparationSubTabsComponent,
    Select
],
  templateUrl: './separation-request.component.html',
  styleUrl: './separation-request.component.scss',
})
export class SeparationRequestComponent implements OnInit, OnDestroy {
  getSeparationDetails = new BehaviorSubject<ISeparation[]>([]);
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  initiateForm!: FormGroup;
  selectedItem :any;
  availableForms: any[] = [];
  substatus: any;
  status: any;
  loading = false;
  recallbuttonConditions = false;
  recallandearlyrelievingbuttonConditions = false;
  isLastWorkingDatePassed = false;
  showSaperationDots = true;
  decription_Storing_Variable: any;
  selectRecallrequest = {} as any;
  postEarlyRelievingRequest = {} as any;
  appover_comments = {} as any;
  recallreason!: FormGroup;
  earlyReleivingform!: FormGroup;
  isLoading = false;
  profileForm!: FormGroup;
  isDataLoaded = false;
  totalCount:any;
 @ViewChild('NoticePopup') NoticePopup?: TemplateRef<any>;
 @ViewChild('initiateModal') initiateModal!: TemplateRef<any>;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    public permissionRouteService: AccessForEmployeeinfoService,
    private router: Router,
    public formValidations: FormValidationsService
  ) {
    this.initiateForm = this.fb.group({
      formId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getonboardPeriodData();
    this.formInitialization();
    this.getEmpInfoFromRoute();
  }

  canAccess(
    action: 'view' | 'create' | 'update' | 'delete',
    permission: string
  ) {
    const value = this.permissionRouteService.canAccessField(
      action,
      permission
    );
    return value;
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.getEmployeeId();
      this.getNodueClearance();
      this.fetchSeparationDetails();
      this.getAvailableForms();
      this.getExitFeeddBackDetails();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.getEmployeeId();
      this.fetchSeparationDetails();
      this.getNodueClearance();
      this.getAvailableForms();
      this.getExitFeeddBackDetails();
    }
  }

 isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  formInitialization() {
    this.recallreason = this.fb.group({
      recallReason: [
        null,
        [
          Validators.required,
          Validators.maxLength(250)
        ],
      ],
    });
    this.earlyReleivingform = this.fb.group({
      earlyReleivingDate: [null, [Validators.required]],
      earlyReleivingReason: [
        null,
        [
          Validators.required,
          Validators.maxLength(400)
        ],
      ],
    });
    // this.profileForm = this.fb.group({
    //   emails: ['', [Validators.required, Validators.email]],
    //   noduerequestedemails: this.fb.array([]),
    // });

    this.profileForm = this.fb.group({
      emails: [
        '',
        [Validators.required, Validators.email, this.duplicateEmailValidator],
      ],
      noduerequestedemails: this.fb.array([]),
    });
  }

  get formemailsfornodue(): FormArray {
    return this.profileForm.get('noduerequestedemails') as FormArray;
  }

  addAlias() {
    this.formemailsfornodue.push(
      this.fb.control('', [
        Validators.required,
        Validators.email,
        this.duplicateEmailValidator,
      ])
    );
  }

  openModallg(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
      keyboard: false
    });
  }

  removeSection(index: number) {
    this.formemailsfornodue.removeAt(index);
  }

  duplicateEmailValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control?.parent) return null;

    const form = control.parent;
    const mainEmailControl = form.root.get('emails');
    const formArray = form.root.get('noduerequestedemails') as FormArray;

    if (!mainEmailControl || !formArray) return null;

    const allEmails = [
      mainEmailControl.value?.toLowerCase().trim(),
      ...formArray.controls.map((c) => c.value?.toLowerCase().trim()),
    ].filter(Boolean);

    const currentEmail = control.value?.toLowerCase().trim();

    const isDuplicate =
      allEmails.filter((email) => email === currentEmail).length > 1;

    return isDuplicate ? { duplicate: true } : null;
  };

  //function to open the modal
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',keyboard: false });
  }

  openModalLg(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  // removeSection(index: number) {
  //   this.formemailsfornodue.removeAt(index);
  // }

  // get formemailsfornodue() {
  //   return this.profileForm.get('noduerequestedemails') as FormArray;
  // }

  // Convenience getter for the emails field
  get emails() {
    return this.profileForm.get('emails');
  }

  // addAlias() {
  //   this.formemailsfornodue.push(
  //     this.fb.control('', [Validators.required, Validators.email])
  //   );
  // }

  requestNoDue(f: FormGroup) {
    this.isLoading = true;
    const additionalEmails = this.profileForm.value.noduerequestedemails.join(', ');
    const noduereq = {
      requestedBy: this.empdata.employeeId,
      raisedFor: this.empdata.employeeId,
      requiredEmails: additionalEmails 
        ? `${this.profileForm.value.emails}, ${additionalEmails}` 
        : this.profileForm.value.emails,
    };
    this.subscription = this.http
      .postdata('NoDueClearanceForm', noduereq)
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.profileForm.reset();
          this.formemailsfornodue.clear();
          this.modalService.dismissAll();
          this.getNodueClearance();
          this.conformationPopup.openSuccessModal(
            'No Due request raised successfully'
          );
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal('reason.error.Message');
          const modalElement = document.getElementById('errorhide');
        },
      });
  }

  //function to get the notice period duration
  nodueDuration: any;
  noticeperiodDuration: any;
  lastWorkingDate: any;
  getonboardPeriodData() {
    this.subscription = this.http.getData(`ServingPeriods`).subscribe({
      next: (res: any) => {
        let noduevalue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLowerCase() == 'button before no due';
        });
        let durationValue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLocaleLowerCase() == 'notice period';
        });
        this.noticeperiodDuration = durationValue?.duration;
        this.nodueDuration = noduevalue.duration;
        console.log(this.nodueDuration);
        this.onCheckNotiesperiod();
      },
    });
  }

  onCheckNotiesperiod() {
    const noticePeriodDays = this.noticeperiodDuration;
    const today = moment(); // Use current date instead of appliedDate
    const futureDate = today.add(noticePeriodDays, 'days');
    const formattedDate = this.formatDate(futureDate);
    this.lastWorkingDate = formattedDate;
  }

  //function to get the nodue list

  //funtion to check the valudation

  //function to get employee by id
  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.empdata = data as Ipersonal;
          console.log(this.empdata);
          // this.isLastWorkingDate(this.empdata.lastworkingday);
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal('Insertion of data faild');
        },
      });
  }

  nodueclearancedetails = [] as any;
  allNodueApproved = false;
  getNodueClearance() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.nodueclearancedetails = data;

          // Check if all nodue records are approved
          const validItems = data.filter((ele: any) => ele.subStatus?.toLowerCase() !== 'rerequested');
          const approvedCount = validItems.filter((ele: any) => ele.status?.toLowerCase() === 'approved').length;
          this.allNodueApproved = validItems.length > 0 && approvedCount === validItems.length;
        },
      });
  }

  areAllNodueRecordsApproved(item: any): boolean {
    return this.allNodueApproved;
  }

  exitfeedbackdata = [] as any;
  exitfeedbacksubmitted = false;
  canInitiateExitFeedback(item: any): boolean {
    return !this.exitfeedbacksubmitted;
  }
  getExitFeeddBackDetails() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`ExitFeedbackRequest/employee/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log('Raw exit feedback data:', data);
          console.log('Data type:', typeof data);
          console.log('Is array:', Array.isArray(data));

          // Handle different response structures
          let feedbackArray = [];
          if (Array.isArray(data)) {
            feedbackArray = data;
          } else if (data && Array.isArray(data.data)) {
            feedbackArray = data.data;
          } else if (data && data.length !== undefined) {
            feedbackArray = [data];
          }

          this.exitfeedbackdata = feedbackArray;
          console.log('Processed feedback array:', this.exitfeedbackdata);
          console.log('Array length:', this.exitfeedbackdata.length);

          const existingRecords = this.exitfeedbackdata.filter((ele: any) => {
            const status = ele?.status?.toLowerCase();
            console.log('Checking status:', status);
            return status === 'initiated' || status === 'submitted';
          });

          console.log('Filtered records:', existingRecords);
          this.exitfeedbacksubmitted = existingRecords.length > 0;
          console.log('Exit feedback submitted:', this.exitfeedbacksubmitted);
        },
        error: (err: any) => {
          console.error('Error fetching exit feedback:', err);
          this.exitfeedbackdata = [];
          this.exitfeedbacksubmitted = false;
        }
      });
  }



  shouldShowButton(date: string): boolean {
    console.log(date);
    let lastworkingdate = date;
    const shouldShow = this.isLastWorkingDate(lastworkingdate);
    return shouldShow;
  }

  shouldShowStatusBasedButton(): boolean {
    const match = this.separationDetails?.some((detail: { status: string }) => {
      const status = detail.status?.toLowerCase().trim();
      console.log('Checking status:', status);
      return status === 'processed' || status === 'early relieving processed';
    });
    console.log('Status match found?', match);
    return match ?? false;
  }

  isLastWorkingDate(lastWorkingDate: string): boolean {
    if (lastWorkingDate) {
      const endDate = new Date(lastWorkingDate);
      const buttonEnabledDate = new Date(endDate);
      buttonEnabledDate.setDate(
        endDate.getDate() - parseInt(this.nodueDuration)
      );
      const currentDate = new Date();
      console.log(this.nodueDuration);

      // Check if the current date is between buttonEnabledDate and endDate
      const isComplete =
        currentDate >= buttonEnabledDate && currentDate <= endDate;
      console.log(isComplete);
      // Check if the current date is past the last working date
      const isPastLastWorkingDate = currentDate > endDate;
      console.log(isPastLastWorkingDate);

      // Return true if either condition is met
      return isComplete || isPastLastWorkingDate;
    }
    return false;
  }

  separationDetails!: any;
  //function to get the separation details of the employee
  fetchSeparationDetails(): void {
    this.isDataLoaded = true;
    const EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`SeparationRequests/getbyemployeeId?Id=${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data)
          if (data) {
            this.isDataLoaded = false;
            this.separationDetails = data;
            this.shouldShowStatusBasedButton();
            console.log(this.separationDetails);
            this.getSeparationDetails.next(data);
            this.substatus = this.getSeparationDetails.value.map(
              (application: { status: any }) => application.status.toLowerCase()
            );
            const seperationStatus1 = [
              'waiting for approval',
              'approved',
              'processed',
              'recalled processed',
              'early relieving processed',
              'extended',
            ];
            this.status = seperationStatus1.some((value) =>
              this.substatus.includes(value)
            );
            console.log(this.status);
            this.checkStatus();
            data.forEach((ele: any) => {
              if (
                (ele?.status?.toLowerCase() == 'waiting for approval' ||
                  ele?.status?.toLowerCase() == 'approved') &&
                ele.recallStatus?.toLowerCase() == 'earlyrelieving'
              ) {
                this.recallandearlyrelievingbuttonConditions = true;
              }
              if (
                (ele?.status?.toLowerCase() == 'recalled' ||
                  ele?.status?.toLowerCase() == 'approved') &&
                ele.recallStatus?.toLowerCase() == 'recalled'
              ) {
                this.recallbuttonConditions = true;
              }
            });
            const current = this.formatDate(moment());
            if (this.formatDate(this.empdata.lastworkingday < current)) {
              this.isLastWorkingDatePassed = true;
            }
          }
        },
        error: (err: any) => {
          this.isDataLoaded = false;
          this.getSeparationDetails.next([]);
        },
      });
  }

  //function to check the status of the request
  checkStatus() {
    if (this.status) {
      this.showSaperationDots = false;
    }
  }

  //function to format the data
  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
  }

  //function to open the modal for the comments
  approverCommentsFunction(Value: any, content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false
    });

    const roleOrder: { [key: string]: number } = {
      RM: 1,
      TM: 2,
      EM: 3, // 'EM' is displayed as HR in the UI
    };

    this.appover_comments = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData || '{}');
      return {
        ...ele,
        metadata: parsedMetaData,
      };
    }).sort((a: any, b: any) => {
      const roleA = a.approverRole?.toUpperCase() || '';
      const roleB = b.approverRole?.toUpperCase() || '';
      return (roleOrder[roleA] || 99) - (roleOrder[roleB] || 99);
    });
  }

  //function to store the disaciption values
  decription(value: any, content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',keyboard: false });
    this.decription_Storing_Variable = value;
  }

  //function to select data of perticular record to  recall the request
  recallRequest(data: any, content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',keyboard: false });
    this.selectRecallrequest = JSON.parse(JSON.stringify(data));
  }

  //function to select the data of early relieving request
  earlyReleivingdata(data: any, content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',keyboard: false });
    this.postEarlyRelievingRequest = data;
    console.log(this.postEarlyRelievingRequest.appliedDate);
  }

  get formattedAppliedDate(): string {
    const date = this.postEarlyRelievingRequest?.appliedDate;
    console.log(date);
    const dt = this.formatDate(date);
    console.log(dt);
    return dt;
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',keyboard: false });
  }
  popupclose() {
    this.profileForm.reset();
    this.recallreason.reset();
    this.earlyReleivingform.reset();
    this.modalService.dismissAll();
  }
  //function to recall the request
  postRecallRequest() {

    this.isLoading = true;
    let currentDate = new Date();
    let payLoad = {
      // id: this.selectRecallrequest.id,
      employeeId: this.selectRecallrequest.employeeId,
      appliedDate: currentDate,
      description: this.recallreason.get('recallReason')?.value,
      lastWorkingDate: this.selectRecallrequest.lastWorkingDate,
      noticePeriodDuration: 0,
      status: 'Recalled',
      recallStatus: 'Recalled',
      requestType: this.selectRecallrequest.requestType,
      comments: this.selectRecallrequest.comments,
      recallReason: this.recallreason.get('recallReason')?.value,
      isDeleted: false,
      jobId: this.selectRecallrequest.jobId,
      currentApprover: this.selectRecallrequest.currentApprover,
      isEarlyRelieving: this.selectRecallrequest.isEarlyRelieving,
      isAcceptEarlyRelieving: this.selectRecallrequest.isAcceptEarlyRelieving,
      earlyRelievingDate: this.selectRecallrequest.earlyRelievingDate,
      parentId: this.selectRecallrequest.id,
      moduleId: environment.RecallrequestmoduleId,
    };
    this.subscription = this.http
      .postdata(`SeparationRequests`, payLoad)
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.isLoading = false;
            this.modalService.dismissAll();
            this.recallreason.reset();
            this.conformationPopup.openSuccessModal(
              'Recall Request raised successfully'
            );
            this.fetchSeparationDetails();
            this.getApprovalStatusCounts();
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(err.error.message);
        },
      });
  }


  openInitiateModal(item: any): void {
    this.selectedItem = item;
    this.initiateForm.reset();
    this.modalService.open(this.initiateModal, { centered: true, backdrop: 'static' });
  }

  getAvailableForms(): void {
    this.subscription = this.http.getData('Form/getAllFormDetails?status=Active&moduleid=33').subscribe({
      next: (response: any) => {
        this.availableForms = response.data || response || [];
      },
      error: (err: any) => {
        console.error('Error loading forms:', err);
        this.availableForms = [];
      }
    });
  }

  initiateExitFeedback(): void {
    if (this.initiateForm.valid && this.selectedItem) {
      this.isLoading = true;
      const payload = {
        employeeId : this.selectedItem.employeeId,
        empFormId: this.initiateForm.get('formId')?.value,
        status: 'Initiated',
        initiatedBy: this.empinfo.employeeId,
        separationId : this.selectedItem.id,
        moduleId : 33,
        lastWorkingDate : this.selectedItem.lastWorkingDate
      };

      this.subscription = this.http.postdata(`ExitFeedbackRequest/initiate`, payload).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Exit feedback form initiated successfully');
        },
        error: (err: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(err.error?.message || 'Failed to initiate form');
        }
      });
    }
  }


  difference = 0;
  getBlockedFutureDate(lastWorkingDate: string): string {
    let earlyrelievingdate =
      this.earlyReleivingform.get('earlyReleivingDate')?.value;
    if (earlyrelievingdate && this.postEarlyRelievingRequest.appliedDate) {
      const d1 = moment(this.postEarlyRelievingRequest.appliedDate);
      const d2 = moment(earlyrelievingdate);
      this.difference = d2.diff(d1, 'days') + 1;
    } else {
      this.difference = 0;
    }
    const formattedDate = moment(lastWorkingDate)
      .startOf('day')
      .format('YYYY-MM-DD');
    return formattedDate;
  }

  //function to raise the early relieving request
  postEarlyrelieving() {
    this.isLoading = true;
    let currentDate = moment();
    let payLoad = {
      // id: this.selectRecallrequest.id,
      employeeId: this.postEarlyRelievingRequest.employeeId,
      appliedDate: currentDate,
      description: this.earlyReleivingform.get('earlyReleivingReason')?.value,
      lastWorkingDate: this.earlyReleivingform.get('earlyReleivingDate')?.value,
      noticePeriodDuration: Math.round(this.difference),
      status: 'Waiting for Approval',
      recallStatus: 'EarlyRelieving',
      comments: this.postEarlyRelievingRequest.comments,
      recallReason: this.postEarlyRelievingRequest.recallReason,
      isDeleted: false,
      jobId: this.postEarlyRelievingRequest.jobId,
      currentApprover: this.postEarlyRelievingRequest.currentApprover,
      isEarlyRelieving: true,
      isAcceptEarlyRelieving:
        this.postEarlyRelievingRequest.isAcceptEarlyRelieving,
      earlyRelievingDate:
        this.earlyReleivingform.get('earlyReleivingDate')?.value,
      parentId: this.postEarlyRelievingRequest.id,
      reasonForEarlyRelieving: this.earlyReleivingform.get(
        'earlyReleivingReason'
      )?.value,
      moduleId: environment.SeparationrequestmoduleId,
    };
    this.subscription = this.http
      .postdata(`SeparationRequests`, payLoad)
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.isLoading = false;
            this.modalService.dismissAll();
            this.earlyReleivingform.reset();
            this.conformationPopup.openSuccessModal(
              'Early Relieving Request raised successfully'
            );
            this.fetchSeparationDetails();
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(err.error.message);
        },
      });
  }
   getApprovalStatusCounts() {
      let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.RecallrequestmoduleId}&EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }
  openModalraise() {
    this.modalService.open(RaiseseparationComponent, { centered: true, backdrop: 'static', keyboard: false, size: 'lg' })
  }

   closeModel() {
    this.modalService.dismissAll();
  }
  noticeDetailsData: any;

noticedetails(item: any): void {
  this.noticeDetailsData = item;
  this.modalService.open(this.NoticePopup, { centered: true });
}

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
