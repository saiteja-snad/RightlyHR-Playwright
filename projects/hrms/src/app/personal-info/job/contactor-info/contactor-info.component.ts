import { Component } from '@angular/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';

@Component({
  selector: 'app-contactor-info',
  imports: [
    DataLoaderContentComponent,
    DateformatPipe,
    ReactiveFormsModule,
    CommonModule,
    NgbPopoverModule,
    NoDataFoundComponent,
    TranslateModule,
    DataLoaderContentComponent,
    InfoIconComponent,
  ],
  templateUrl: './contactor-info.component.html',
  styleUrl: './contactor-info.component.scss',
})
export class ContactorInfoComponent {

  loading = false;
  empdata = {} as any;
  dynamicData = new BehaviorSubject<any>([]);
  dynamicDataCount = new BehaviorSubject<any>([]);
  currentdateformate!: string;
  empinfo = {} as IJob;
  onboardDuration: any;
  Readyforonboardbutton: boolean = false;
  issIssueDateValid: boolean = true;
  currentDate: Date = new Date();
  subscription!: Subscription;
  selecteddata: any;
  getSeparationDetails = [] as any;
  probationduration: any;
  nodueDuration: any;
  ContractExtensionDuration: any;
  contractConversionBBF: any;
  contractConversionTimes: any
  probationDays: any;
  disablebuttonforonboard: boolean = false;
  disablebuttonforonboard1: boolean = false;
  disablebuttonforonboard2: boolean = false;
  disablebuttonforonboard3: boolean = false;
  previousEmpData = {} as any;
  loggedinuser = {} as any;
  offboradingchanges = [] as any;
  jobPostData: any;
  changes = [] as any;
  imgurl!: string;
  isEditing: boolean = false;
  extendreasonForm!: FormGroup;
  isLoading = false;
  selectedData = {} as any;
  requestedData!: any;
  buttonviewwhenExtended: boolean = false;
  myApproverCommentss: any;
  appcomment = {} as any;
  difference = 0;
  dojDate:any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpService,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    public formValidations: FormValidationsService
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.getEmpInfoFromRoute();
    this.loggedinuser = this.authService.getToken();
    this.formInitialization();
    this.extendreasonForm.get('contractstartdate')?.valueChanges.subscribe(() => {
    this.extendreasonForm.updateValueAndValidity();
  });
    this.getEmployeeId();
    this.getonboardPeriodData();
    this.getOnboardrequest();
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.dojDate = this.formatDate(this.empinfo.dateOfJoining);
      this.getEmployeeId();
      this.getOnboardrequest();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.dojDate = this.formatDate(this.empinfo.dateOfJoining);
      this.getEmployeeId();
      this.getOnboardrequest();
    }
  }

  formInitialization() {
    // this.extendreasonForm = this.fb.group({
    //   contractstartdate: [null, [Validators.required]],
    //   contractenddate: [null, [Validators.required]],
    //   extendReason: [null, [Validators.required, Validators.maxLength(250)]],
    //   //extenddate: [null, [Validators.required, Validators.maxLength(250)]],
    // });
    this.extendreasonForm = this.fb.group({
    contractstartdate: [null, [Validators.required]],
    contractenddate: [null, [Validators.required]],
    extendReason: [null, [Validators.required, Validators.maxLength(250)]],
  }, {
    validators: this.dateRangeValidator
  });
  }

  dateRangeValidator(formGroup: FormGroup) {
    const start = formGroup.get('contractstartdate')?.value;
    const end = formGroup.get('contractenddate')?.value;

    if (start && end && new Date(start) > new Date(end)) {
      formGroup.get('contractenddate')?.setErrors({ invalidRange: true });
    } else {
      if (formGroup.get('contractenddate')?.hasError('invalidRange')) {
        formGroup.get('contractenddate')?.setErrors(null);
      }
    }
    return null;
  }

  openmodel(content: any, data: any) {
    this.selectedData = data;
    this.modalService.open(content, { centered: true });
  }

  // check allowed status
  isStatusAllowed(): boolean {
    const allowedStatuses = ['waiting for approval', 'approved', 'processed', 'extended'];
    const hasAllowedStatus = this.dynamicData.value.some((ele: any) =>
      allowedStatuses.includes(ele.status?.toLowerCase())
    );
    return hasAllowedStatus;
  }

  //show commnets data
  appover_comments = {} as any;
  fustiontostorefeedback(data: any, content: any) {
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

    this.appover_comments = data.map((ele: any) => {
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

  //Block past dates
  getBlockedpastDate(enddate: string): string {
    const today = moment().startOf('day');
    const contractEnd = moment(enddate).startOf('day');
    const minDate = moment.max(today, contractEnd);
    return minDate.format('YYYY-MM-DD');
  }

  

  
  // raise for employee conversion
  requestForConvertion() {
    const loggedinuser = this.authService.getToken();
    const employeeId = parseInt(this.empinfo.employeeId);
    const latestRecord = this.dynamicData.value[this.dynamicData.value.length - 1];
    this.requestedData = latestRecord;
    console.log(this.requestedData);

    const requestBody = {
      employeeId: employeeId,
      currentApproverId: loggedinuser.employeeId,
      referenceId: this.requestedData.id,
      //contractExtendedDate: this.formatDate(this.extendreasonForm.get('extenddate')?.value),
      comments: this.extendreasonForm.get('extendReason')?.value,
      contractType: 'Conversion'
    };
    this.http
      .postdata(`ContractDetails/raiseContractRequest`, requestBody)
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Conversion request submitted successfully'
          );
          this.getOnboardrequest();
        },
        error: (error: any) => {
          console.log(error);
          this.conformationPopup.openErrorModal(error.error.details);
        },
      });

  }

  //raise extend request
  requestForextension() {
    const loggedinuser = this.authService.getToken();
    const requestBody = {
      employeeId: this.selectedData.employeeId,
      currentApproverId: loggedinuser.employeeId,
      referenceId: this.selectedData.id,
      contractStartDate: this.formatDate(this.extendreasonForm.get('contractstartdate')?.value),
      contractEndDate: this.formatDate(this.extendreasonForm.get('contractenddate')?.value),
      //contractExtendedDate: this.formatDate(this.extendreasonForm.get('extenddate')?.value),
      comments: this.extendreasonForm.get('extendReason')?.value,
      contractType: 'Extension'
    };
    this.http
      .postdata(`ContractDetails/raiseContractRequest`, requestBody)
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Extension request submitted successfully'
          );
          this.getOnboardrequest();
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error.error.details ? error.error.details : error.error.details);
        },
      });
  }



  reRequestContract() {
    if (this.selectedData.contractType === 'Extension') {
      const loggedinuser = this.authService.getToken();
      const requestBody = {
        employeeId: this.selectedData.employeeId,
        currentApproverId: loggedinuser.employeeId,
        referenceId: this.selectedData.id,
        contractStartDate: this.formatDate(this.extendreasonForm.get('contractstartdate')?.value),
        contractEndDate: this.formatDate(this.extendreasonForm.get('contractenddate')?.value),
        //contractExtendedDate: this.formatDate(this.extendreasonForm.get('extenddate')?.value),
        comments: this.extendreasonForm.get('extendReason')?.value,
        contractType: 'Extension'
      };
      this.http
        .postdata(`ContractDetails/raiseContractRequest`, requestBody)
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Extension request submitted successfully'
            );
            this.getOnboardrequest();
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal(error.error.details ? error.error.details : error.error.details);
          },
        });
    }
    else{
      this.extendreasonForm.get('contractstartdate')?.clearValidators();
      this.extendreasonForm.get('contractenddate')?.clearValidators();
      // this.extendreasonForm.get('extendReason')?.clearValidators();
      let payload = {
      "employeeId": this.selectedData.employeeId,
      "contractStartDate": this.selectedData.contractStartDate,
      "contractEndDate": this.selectedData.contractEndDate,
      //"contractExtendedDate": this.selectedData.contractExtendedDate,
      "contractType": "Conversion",
      "status": "Waiting for Approval",
      "contractFeedback": this.extendreasonForm.get('extendReason')?.value,
      "moduleId": 26,
      "parentId" : this.selectedData.id
    }
    this.http.postdata(`ContractDetails/postContractActivationEmployees`, payload).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Re-Request raised successfully');
      },
      error: (error: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal(error.error.message);
      }
    })
    }
    
  }

  //format date
  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
  }

  //get contract employee details
  convdata: any;
  getOnboardrequest() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);

    this.subscription = this.http
      .getData(`ContractDetails/getbyemployeeId/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          // 🔹 Filter out records where status is "Active"
          const filteredData = data.data;

          if (filteredData.length === 0) {
            console.warn('No contract records found (excluding Active)');
            return;
          }

          this.dynamicData.next(filteredData);
          this.convdata = filteredData[0];

          this.disablebuttonforonboard1 =
            (this.convdata?.status == null ||
              this.convdata?.status === 'Waiting for Approval' ||
              this.convdata?.status === 'Approved' ||
              this.convdata?.status === 'Processed' ||
              this.convdata?.status === 'Rejected') &&
            (this.convdata?.contractType === 'Conversion' ||
              this.convdata.contractType === 'Extension');

          this.disablebuttonforonboard2 =
            (this.convdata?.status === 'Waiting for Approval' ||
              this.convdata?.status === 'Approved' ||
              this.convdata?.status === 'Processed' ||
              this.convdata?.status === 'Rejected') &&
            (this.convdata.contractType === 'Extension' ||
              this.convdata.contractType === 'Conversion');

          this.disablebuttonforonboard3 =
            this.showButtonBeforeContractExtendedDate(this.convdata.contractEndDate) &&
            (this.convdata.contractType === 'Extension' ||
              this.convdata.contractType === 'Contract' ||
              this.convdata.contractType === 'Conversion');

          this.dynamicDataCount = filteredData;

          let filtereddata = this.getSeparationDetails.some((ele: any) => {
            return ele.status?.toLowerCase() === 'rejected';
          });

          this.disablebuttonforonboard = filtereddata;

          this.extendCondition(this.dynamicDataCount);
          this.isStatusAllowed();
        },
        error: (error: any) => {
          console.error('Error fetching onboard request data:', error);
        },
      });
  }

  // check the latest extend record
  extendCondition(data: any) {
    if (data && data.length) {
      const latestRecord = data[data.length - 1];
      const isLatestExtended =
        latestRecord.status?.toLowerCase() === 'extended' ||
        latestRecord.status?.toLowerCase() === 'processed';
      const allExtended = data.every(
        (ele: any) =>
          ele.status?.toLowerCase() === 'extended' ||
          ele.status?.toLowerCase() === 'processed'
      );
      this.buttonviewwhenExtended = isLatestExtended || allExtended;
    } else {
      this.buttonviewwhenExtended = false;
    }
  }

  //get all config data to check conditions
  getonboardPeriodData() {
    this.subscription = this.http.getData(`ServingPeriods`).subscribe({
      next: (res: any) => {
        this.Readyforonboardbutton = JSON.parse(
          localStorage.getItem('ReadyforOnboard') || '{}'
        );
        let durationValue = res.find((ele: any) => {
          return ele.servingPeriodType === 'ContractExtensionButtonBefore';
        });
        let probationdurationValue = res.find((ele: any) => {
          return (
            ele.servingPeriodType?.toLowerCase() == 'button before probation'
          );
        });
        let noduevalue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLowerCase() == 'button before no due';
        });
        let ProbationDays = res.find((ele: any) => {
          return (
            ele.servingPeriodType?.toLowerCase() == 'probation noticeperiod'
          );
        });
        let ContractExtensionDays = res.find((ele: any) => {
          return (
            ele.servingPeriodType === 'ContractExtensionDays'
          );
        });
        let ContractConversionTimes = res.find((ele: any) => {
          return (
            ele.servingPeriodType === 'ContractConversionTimes'
          );
        });
        let ContractConversionButtonBefore = res.find((ele: any) => {
          return (
            ele.servingPeriodType === 'ContractConversionButtonBefore'
          );
        });
        this.contractConversionBBF = ContractConversionButtonBefore.duration
        this.contractConversionTimes = ContractConversionTimes.duration
        this.onboardDuration = durationValue?.duration;
        this.probationDays = ProbationDays?.duration;
        this.probationduration = probationdurationValue?.duration;
        this.nodueDuration = noduevalue?.duration;
        this.ContractExtensionDuration = ContractExtensionDays?.duration;
      },
    });
  }
  // check formatted date
  get formattedAppliedDate(): string {
    const date = this.selectedData.contractExtendedDate;
    if (!date) return '';
    const dt = this.formatDate(date);
    return dt;
  }

  get formattedStartDate(): string {
    const date = this.selectedData.contractStartDate;
    if (!date) return '';
    const dt = this.formatDate(date);
    return dt;
  }
  get formattedEndDate(): string {
    const date = this.selectedData.contractEndDate;
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // next day
    const endDates = endDate.toISOString().split('T')[0];
    const dt = this.formatDate(endDates);
    return dt;
  }
 showButtonBeforeContractExtendedDate(contractExtendedEndDate: string): boolean {
    console.log(contractExtendedEndDate);
    const shouldShow = (this.isContractExtendEndDateComplete(contractExtendedEndDate));
    return shouldShow;
  }

  isContractExtendEndDateComplete(contractExtendEndDate: string) {
    if (contractExtendEndDate) {
      const endDate = new Date(contractExtendEndDate);
      const buttonEnabledDate = new Date(endDate);
      buttonEnabledDate.setDate(endDate.getDate() - parseInt(this.onboardDuration));
      const currentDate = new Date();
      const isComplete = currentDate >= buttonEnabledDate;
      return isComplete;
    }
    return false;
  }

  // comments
  approverComments(value: any) {
    this.myApproverCommentss = value;
  }

  commentsFunction(Value: any) {
    console.log(Value);
    this.appcomment = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele,
        metadata: parsedMetaData,
      };
    });
  }

  readyforonboardRequest() {
    this.empdata.onboardstatus = true;
    this.empdata.empstatus = 'Prospective'
    this.empdata.empType = 'Onboard'  

    this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.empdata).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        if (data.statusCode === 409) {
          this.conformationPopup.openSuccessModal(data.message);
        } else if (data.statusCode === 200) {
          this.conformationPopup.openSuccessModal(
            'Employee onboarded successfully'
          );
        }
        this.getEmployeeId();
        this.getOnboardrequest();
      },
      error: (reason: any) => {
        if (reason.status === 400) {
          this.conformationPopup.openErrorModal(reason.message);
        }
      },
    });
  }

  closeonBoard() {
    this.modalService.dismissAll();
  }

  //getbyemployeeId
  getEmployeeId(): void {
    this.loading = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.loading = false;
          this.empdata = data;
        },
        error: (err: any) => {
          console.log(err);
          this.loading = false;
        },
      });
    // if (employeeId) {
    //   this.subscription = this.http
    //     .getData(`JobApplicantsData/getByEmployeeId/${employeeId}`)
    //     .subscribe({
    //       next: (data: any) => {
    //         if (data) {
    //           this.jobPostData = data;
    //           console.log(this.jobPostData);
    //         }
    //       },
    //     });
    // }
  }

 

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
