import { Component } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Router } from '@angular/router';
import { FormGroup, NgForm } from '@angular/forms';
import { Ipersonal } from '../../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { IJob } from '../../../Interfaces/onboarding-documents';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-onboarding-requests',
  imports: [DateformatPipe, CommonModule, NoDataFoundComponent],
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
    console.log(this.empinfo);
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
      console.log(this.currentdateformate)
      console.log('Button Enabled Date (after setting date):', buttonEnabledDate);

      // Get the current date
      const currentDate = new Date();
      this.currentdateformate = this.formatDate(this.currentDate)
      console.log(this.currentdateformate)
      const isComplete = currentDate >= buttonEnabledDate && currentDate <= trainingEndDate;
      console.log('Is training end date complete?', isComplete);

      return isComplete;
    }
    else return false;
  }
  fustiontostorefeedback(data: any) {
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
        console.log(data);
        this.conformationPopup.openSuccessModal('Request for onboard successfully')
      },
      error: (reason: any) => {
        console.log(reason);
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
        this.buttonviewwhenExtended = data.some((ele: any) => ele.status?.toLowerCase() === 'extended');
        console.log(this.buttonviewwhenExtended)
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

  getonboardPeriodData() {
    this.subscription = this.http.getData(`ServingPeriods`).subscribe({
      next: (res: any) => {
        console.log(res);
        this.Readyforonboardbutton = JSON.parse(localStorage.getItem("ReadyforOnboard") || '{}');
        let durationValue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLocaleLowerCase() == 'button before onboard'
        })
        let probationdurationValue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLocaleLowerCase() == 'button before probation'
        })
        let noduevalue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLocaleLowerCase() == 'button before no due'
        })
        let ProbationDays = res.find((ele: any) => {
          return ele.servingPeriodType?.toLocaleLowerCase() == 'probation noticeperiod'
        })
        console.log(durationValue);
        this.onboardDuration = durationValue.duration;
        this.probationDays = ProbationDays.duration;
        this.probationduration = probationdurationValue.duration;
        this.nodueDuration = noduevalue.duration
      }
    })
  }

  onboardstatuschange() {
    this.empdata.onboardstatus = true;
    this.empdata.substatus = 'Trainee Onboarded'
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

  jobtab() {
    console.log(this.empinfo)
    if (this.previousEmpData.issalaryhold != this.empdata.issalaryhold) {
      let EventsData = {
        firstName: this.empinfo.firstName,
        lastName: this.empinfo.lastName,
        middleName: this.empinfo.middleName,
        senderEmail: this.loggedinuser.workEmail,
        senderName: this.loggedinuser.firstName + " " + this.loggedinuser.middleName + " " + this.loggedinuser.lastName,
        issalaryhold: this.empdata.issalaryhold,
        employeeId: this.empinfo.employeeId
      }
      if (this.loggedinuser.middleName) {
        EventsData.senderName = `${this.loggedinuser.firstName} ${this.loggedinuser.middleName} ${this.loggedinuser.lastName}`
      } else {
        EventsData.senderName = `${this.loggedinuser.firstName} ${this.loggedinuser.lastName}`
      }
      console.log(EventsData);
      this.subscription = this.http.postdata(`CustomEmail/Issalary`, EventsData).subscribe({
        next: (data: any) => {
          console.log(data);
          this.conformationPopup.openSuccessModal('Email Sent');
          setTimeout(function () {
            location.reload();
          }, 2000);
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    }
    this.empdata.generateOffer = false
    if (this.empdata.empstatus == 'Active' && this.empdata?.substatus == 'Offer Letter Accepted') {
      this.empdata.substatus = 'Probation'
      this.empdata.empType = 'Probation'
    }
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.empdata).subscribe({
      next: (data: any) => {
        console.log(data);
        if (data.statusCode === 409) {
          const modalElement = document.getElementById('successhide');
          this.conformationPopup.openSuccessModal(data.message)
          window.location.reload();
        }
        else if (data.statusCode === 200) {
          if (data.employeeData.empstatus == 'Active') {
            this.updateOnboardingStatustoOnboard(data);
          }
          this.conformationPopup.openSuccessModal(data.message)
        }
        localStorage.setItem("ReadyforOnboard", 'false');
        this.router.navigate(["/admin/job"]);
        this.getEmployeeId();
        this.WebNotificationForOnboarding();
        this.WebNotificationForOffboarding();
        setTimeout(() => {
          if (this.previousEmpData.empstatus != data.employeeData.empstatus) {
            this.router.navigate(["/admin/active-interns"]);
          }
          else {
            window.location.reload();
          }
        }, 2000);
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status === 400) {
          this.conformationPopup.openErrorModal(reason.message)
          setTimeout(function () {
            location.reload();
          }, 2000);
        }
      },
      // complete: () => job.reset()
    })
  }

  closeonBoard() {
    window.location.reload();
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
  //function to get webnotification
  WebNotificationForOnboarding() {
    let loggedInUser = this.authService.getToken();

    const currentDate = new Date()
    if (this.previousEmpData.dateOfJoining != this.empdata.dateOfJoining || this.previousEmpData.probationEndDate != this.empdata.probationEndDate
      || this.previousEmpData.probationStatus != this.empdata.probationStatus || this.previousEmpData.noticePeriod != this.empdata.noticePeriod
      || this.previousEmpData.backgroundCheckStatus != this.empdata.backgroundCheckStatus || this.previousEmpData.pf != this.empdata.pf
      || this.previousEmpData.esic != this.empdata.esic || this.previousEmpData.pt != this.empdata.pt || this.previousEmpData.issalaryhold != this.empdata.issalaryhold
      || this.previousEmpData.insurance != this.empdata.insurance || this.previousEmpData.branchCode != this.empdata.branchCode) {


      if (this.previousEmpData.dateOfJoining !== this.empdata.dateOfJoining) {
        this.changes.push("Date of Joining");
      }

      if (this.previousEmpData.probationEndDate !== this.empdata.probationEndDate) {
        this.changes.push("Probation End Date");
      }

      if (this.previousEmpData.probationStatus != this.empdata.probationStatus) {
        this.changes.push("Probation Status");

      }
      if (this.previousEmpData.issalaryhold != this.empdata.issalaryhold) {
        this.changes.push("Salary Hold");
      }
      if (this.previousEmpData.noticePeriod != this.empdata.noticePeriod) {
        this.changes.push("Notice Period");
      }
      if (this.previousEmpData.backgroundCheckStatus != this.empdata.backgroundCheckStatus) {
        this.changes.push("Background Check Status");
      }
      if (this.previousEmpData.pf != this.empdata.pf) {
        this.changes.push("PF");
      }
      if (this.previousEmpData.esic != this.empdata.esic) {
        this.changes.push("ESIC");
      }
      if (this.previousEmpData.pt != this.empdata.pt) {
        this.changes.push("PT");
      }
      if (this.previousEmpData.insurance != this.empdata.insurance) {
        this.changes.push("Insurance");

      }
      if (this.previousEmpData.branchCode != this.empdata.branchCode) {
        this.changes.push("Branch Location / Code");

      }

      if (this.changes.length > 0) {
        let changesMessage = this.changes.join(', ');

        console.log(this.changes);

        console.log(changesMessage);

        let webdata = {
          message: `"Onboarding Details"`,
          sentTo: this.empdata.workEmail,
          isRead: false,
          isDelete: false,
          notificationDate: currentDate,
          notificationType: `${loggedInUser.firstName ?? ''} ${loggedInUser.middleName ?? ''} ${loggedInUser.lastName ?? ''} had made changes to the ${changesMessage} Fields in
      the Job tab for your team member, ${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''} ${this.empdata.lastName ?? ''}`,
          empId: this.empdata.employeeId
        };
        console.log(webdata);

        this.subscription = this.http.postdata(`Notification/Notify/Manager`, webdata).subscribe({
          next: (data: any) => {
            console.log(data);

          },
          error: (err: any) => {
            console.log(err);
          },
          complete: () => {

          }
        });
      }
    }

  }

  WebNotificationForOffboarding() {
    let loggedInUser = this.authService.getToken();

    const currentDate = new Date()
    if (this.previousEmpData.termreasonoffboard != this.empdata.termreasonoffboard || this.previousEmpData.eligibleforrehire != this.empdata.eligibleforrehire
      || this.previousEmpData.lastworkingday != this.empdata.lastworkingday) {


      if (this.previousEmpData.termreasonoffboard !== this.empdata.termreasonoffboard) {
        this.offboradingchanges.push("Exit Reason");
      }

      if (this.previousEmpData.eligibleforrehire !== this.empdata.eligibleforrehire) {
        this.offboradingchanges.push("Eligible For Rehire");
      }

      if (this.previousEmpData.lastworkingday !== this.empdata.lastworkingday) {
        this.offboradingchanges.push("Last Working Day");

      }
      if (this.offboradingchanges.length > 0) {
        let changesMessageinoffboarding = this.offboradingchanges.join(', ');
        console.log(this.offboradingchanges);

        console.log(changesMessageinoffboarding);

        let webdata = {
          message: `"Offboarding Details"`,
          sentTo: this.empdata.workEmail,
          isRead: false,
          isDelete: false,
          notificationDate: currentDate,
          notificationType: `${loggedInUser.firstName ?? ''} ${loggedInUser.middleName ?? ''} ${loggedInUser.lastName ?? ''} had made changes to the ${changesMessageinoffboarding} Fields in the Job tab for your team member,
           ${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''} ${this.empdata.lastName ?? ''}`,
          empId: this.empdata.employeeId
        };
        this.subscription = this.http.postdata(`Notification/Notify/Manager`, webdata).subscribe({
          next: (data: any) => {
            console.log(data);

          },

          error: (err: any) => {
            console.log(err);
          },
          complete: () => {

          }
        });

      }

    }
  }

  // getEmployeeId() {

  //   let employeeId = parseInt(this.empinfo.employeeId);
  //   console.log(this.empinfo);

  //   this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
  //     next: (data: any) => {
  //       console.log(data);
  //       this.previousEmpData = JSON.parse(JSON.stringify(data))
  //       this.empdata = data as Ipersonal
  //       this.previousEmpData.lastworkingday = this.formatDate(this.previousEmpData.lastworkingday);
  //       this.previousEmpData.dateOfJoining = this.formatDate(this.previousEmpData.dateOfJoining);
  //       this.previousEmpData.probationEndDate = this.formatDate(this.previousEmpData.probationEndDate);
  //       this.previousEmpData.offerIssueddate = this.formatDate(this.previousEmpData.offerIssueddate);
  //       this.empdata.lastworkingday = this.formatDate(this.empdata.lastworkingday);
  //       this.empdata.dateOfJoining = this.formatDate(this.empdata.dateOfJoining);
  //       this.empdata.probationEndDate = this.formatDate(this.empdata.probationEndDate);
  //       this.empdata.offerIssueddate = this.formatDate(this.empdata.offerIssueddate);
  //       this.empdata.trainingEndDate = this.formatDate(this.empdata.trainingEndDate)

  //       console.log(this.empdata);
  //       this.imgurl = this.empdata.profilePic;
  //       console.log(this.imgurl);

  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //       this.conformationPopup.openErrorModal("Insertion of data failed")
  //       setTimeout(function () {
  //         location.reload();
  //       }, 2000);

  //     }
  //   });

  //   if (employeeId) {
  //     this.subscription = this.http.getData(`JobApplicantsData/getByEmployeeId/${employeeId}`).subscribe({
  //       next: (data: any) => {
  //         if (data) {
  //           this.jobPostData = data;
  //           console.log(this.jobPostData);
  //         }
  //       }
  //     })
  //   }
  // }

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
