import { Component } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IJob } from '../../../Interfaces/onboarding-documents';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-onboarding-requests',
  imports: [DateformatPipe, CommonModule, NoDataFoundComponent, TranslateModule],
  templateUrl: './onboarding-requests.component.html',
  styleUrl: './onboarding-requests.component.scss'
})

export class OnboardingRequestsComponent {
  empdata = {} as any;
  dynamicData=new BehaviorSubject<any>([]);
  currentdateformate!: string
  empinfo = {} as IJob;
  onboardDuration: any;
  Readyforonboardbutton: boolean = false;
  issIssueDateValid: boolean = true;
  currentDate: Date = new Date();
  subscription!: Subscription;
  selecteddata: any;
  getSeparationDetails = [] as any;
  probationduration: any;
  nodueDuration: any
  probationDays: any;
  disablebuttonforonboard: boolean = false;
  previousEmpData = {} as any;
  loggedinuser = {} as any;
  offboradingchanges = [] as any;
  jobPostData: any
  changes = [] as any
  imgurl!: string;
  isEditing: boolean = false;

  constructor(private authService: AuthService, private router: Router, private http: HttpService, 
    private conformationPopup: OpenModalService,private modalService: NgbModal,public rbac:RbacService) {
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.loggedinuser = this.authService.getToken();
    this.getEmployeeId();
    this.getOnboardrequest();
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  isStatusAllowed(): boolean {
    const allowedStatuses = ['waiting for approval', 'approved', 'processed'];
    const hasAllowedStatus = this.dynamicData.value.some((ele: any) => allowedStatuses.includes(ele.status?.toLowerCase()));
    return hasAllowedStatus;
  }

  isTrainingEndDateComplete() {
    // Get the training end date from your data (assuming it's stored in empdata)
    if (this.empdata.trainingEndDate) {
      const trainingEndDate = new Date(this.empdata.trainingEndDate);
      // Calculate the date up to which the button should be enabled based on the minimum serving period duration
      const buttonEnabledDate = new Date(trainingEndDate);
      buttonEnabledDate.setDate(trainingEndDate.getDate() - parseInt(this.onboardDuration));
      this.currentdateformate = this.formatDate(buttonEnabledDate);
      // Get the current date
      const currentDate = new Date();
      this.currentdateformate = this.formatDate(this.currentDate)
      const isComplete = currentDate >= buttonEnabledDate && currentDate <= trainingEndDate;
      return isComplete;
    }
    else return false;
  }

  fustiontostorefeedback(data: any,content:any) {
    this.modalService.open(content, { centered: true});
    this.selecteddata = data;
  }

  requestForOnboard() {
    // Fetch dynamic data from getEmployeeId method
    const employeeId = parseInt(this.empinfo.employeeId);
    const dateOfJoining = this.empinfo.dateOfJoining;
    const trainingEndDate = this.empinfo.trainingEndDate;
    const currentDate = new Date().toISOString();
    // Construct the request body
    const requestBody = {
      employeeid: employeeId,
      requestedById: this.authService.getToken().employeeId,
      trainingStartDate: dateOfJoining,
      trainingEndDate: trainingEndDate,
      extendedDate: null,
      updatedDate: null,
      createdDate: null,
      requestedDate: currentDate,
      status: 'Waiting for Approval',
      comments: null,
      feedbackComments: null
    };
    // Send the POST request
    this.http.postdata('onboardRequest', requestBody).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal("Onboard Request submitted successfully")
        this.getOnboardrequest();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error.error.message)
      }
    });
  }

  requestforOnboard() {
    const trainee = {
      RequestedBy: this.empdata.employeeId,
      moduleId: 15
    };
    this.subscription = this.http.postdata("TraineeAppointmentLetter/OnBoardingPendingApprovals", trainee).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Request for onboard successfully')
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.Message)
      },
    })
  }

  redirectTo(uri: string) {
    document.querySelectorAll('.modal-backdrop.show').forEach((element: any) => {
      element.style.display = 'none';
    });
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {

      this.router.navigate([uri])
    });

  }

  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data
  }

  buttonviewwhenExtended: boolean = false;
  getOnboardrequest() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`onboardRequest/getbyemployeeId?Id=${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.dynamicData.next(data);

        let filtereddata = this.getSeparationDetails.some((ele: any) => {
          return ele.status?.toLowerCase() === 'rejected';
        })
        this.disablebuttonforonboard = filtereddata
        this.extendCondition(data);
        // this.isTrainingEndDateComplete();
        this.getonboardPeriodData();
        this.isStatusAllowed();
        console.log(this.isStatusAllowed())
      },
      error: (error: any) => {
        console.error('Error fetching onboard request data:', error);
      }
    });
  }
extendCondition(data:any){
  if (data && data.length) {
    const latestRecord = data[data.length - 1]; // Get the last (latest) record
  
    const isLatestExtended = latestRecord.status?.toLowerCase() === 'extended' || latestRecord.status?.toLowerCase() === 'Processed' ;
  
    const allExtended = data.every((ele: any) => ele.status?.toLowerCase() === 'extended' || ele.status?.toLowerCase() === 'Processed' );
  
    this.buttonviewwhenExtended = isLatestExtended || allExtended;
  } else {
    this.buttonviewwhenExtended = false;
  }
}
  getonboardPeriodData() {
    this.subscription = this.http.getData(`ServingPeriods`).subscribe({
      next: (res: any) => {
        console.log(res);
        this.Readyforonboardbutton = JSON.parse(localStorage.getItem("ReadyforOnboard") || '{}');
        let durationValue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLowerCase() == 'button before onboard'
        })
        let probationdurationValue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLowerCase() == 'button before probation'
        })
        let noduevalue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLowerCase() == 'button before no due'
        })
        let ProbationDays = res.find((ele: any) => {
          return ele.servingPeriodType?.toLowerCase() == 'probation noticeperiod'
        })
        console.log(durationValue);
        this.onboardDuration = durationValue?.duration;
        this.probationDays = ProbationDays?.duration;
        this.probationduration = probationdurationValue?.duration;
        this.nodueDuration = noduevalue?.duration
      }
    })
  }
  
  myApproverCommentss: any;
  approverComments(value: any) {
    this.myApproverCommentss = value;
  }

  appcomment = {} as any;
  commentsFunction(Value: any) {
    console.log(Value)
    this.appcomment = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele,
        metadata: parsedMetaData
      };
    });
    console.log(this.appcomment)
  }

readyforonboardRequest() {
   this.empdata.onboardstatus = true;
    this.empdata.substatus = 'Trainee Onboarded'
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.empdata).subscribe({
      next: (data: any) => {
         this.modalService.dismissAll();
        if (data.statusCode === 409) {
          this.conformationPopup.openSuccessModal(data.message)
        }
        else if (data.statusCode === 200) {
          if (data.employeeData.empstatus == 'Active') {
            this.updateOnboardingStatustoOnboard(data);
          }
          this.conformationPopup.openSuccessModal('Employee onboarded successfully')
        }
        this.getEmployeeId();
        this.getOnboardrequest();
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status === 400) {
          this.conformationPopup.openErrorModal(reason.message)
        }
      },
      // complete: () => job.reset()
    })
  }

  closeonBoard() {
    this.modalService.dismissAll();
  }

  updateOnboardingStatustoOnboard(Value: any) {
    let data = {
      employeeId: Value.employeeData.employeeId,
      status: "Onboarded",

    }
    console.log(data);

    this.subscription = this.http.postdata('JobApplicantsData/UPDATERbyEmployeeId', data).subscribe({
      next: (data: any) => {
        console.log(data);
        if (this.jobPostData.id) {
          this.updateJobapplicantdata();
        }
      },
    })
  }
  updateJobapplicantdata() {
    const empData = JSON.parse(localStorage.getItem('personaldata') || '{}');
    const data = {
      status: "Onboarded",
      employeeId: parseInt(empData.employeeId),
      id: this.jobPostData.id,
      firstName: empData.firstName,
      lastName: empData.lastName,
      jobId: this.jobPostData.jobId,
      emailid: empData.emailaddress,
      mobileNumber: empData.contactnumber,
      resume: 'demo',
      gender: empData.gender,
    }
    this.subscription = this.http
      .postdata('JobApplicantsData/UPDATER', data)
      .subscribe({
        next: (data: any) => {
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });

  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    console.log(this.empinfo);

    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.empdata = data;
        // this.patchForm(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    });

    if (employeeId) {
      this.subscription = this.http.getData(`JobApplicantsData/getByEmployeeId/${employeeId}`).subscribe({
        next: (data: any) => {
          if (data) {
            this.jobPostData = data;
            console.log(this.jobPostData);
          }
        }
      })
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
