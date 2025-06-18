import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { AuthService } from '../../../services/auth.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-raiseseparation',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './raiseseparation.component.html',
  styleUrl: './raiseseparation.component.scss'
})
export class RaiseseparationComponent {
separationRequestForm!: FormGroup;
  postSeparationRequest = {} as any;
  empinfo: any;
  loading = false;
  subscription!: Subscription;
  isLoading = false;
  jobdetails = new BehaviorSubject<any[]>([]);
  noticeperiodDuration: any;
  status: any
  substatus: any
  showSaperationDots = true;
  employedata: any
  joiningDate: any;

  constructor(private modalService: NgbModal,
    private authService: AuthService,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
    public permissionRouteService: AccessForEmployeeinfoService,
    private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getEmpInfoFromRoute();
    this.getSeparationRequest();

  }

  initializeForm(): void {
    this.separationRequestForm = this.fb.group({
      appliedDate: [new Date().toISOString().substring(0, 10), Validators.required],
      jobRole: [{ value: '', disabled: true }],
      departmentName: [{ value: '', disabled: true }],
      team: [{ value: '', disabled: true }],
      teamManager: [{ value: null, disabled: true }],
      reportingManager: [{ value: null, disabled: true }],
      description: [null, [Validators.required, Validators.maxLength(400)]],
      isEarlyRelieving: [false],
      earlyRelievingDate: [null, Validators.required],
      reasonForEarlyRelieving: [null, [Validators.required, Validators.maxLength(400)]]
    });
    // Disable early relieving fields by default
    this.toggleEarlyRelievingFields(false);
  }

  closeAll() {
    this.separationRequestForm.reset();
    this.modalService.dismissAll();
  }

  getJobDetails() {
    this.loading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId);

    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.loading = false;
        console.log('Job Details Data:', data);
        const jobInfo = data[0];

        if (jobInfo) {
          this.postSeparationRequest = jobInfo
          this.separationRequestForm.patchValue({
            jobRole: jobInfo.jobRole,
            departmentName: jobInfo.departmentName,
            team: jobInfo.subdepartmentName,
            teamManager: `${jobInfo?.firstName ?? ''} ${jobInfo?.middleName ?? ''} ${jobInfo?.lastName ?? ''}`,
            reportingManager: `${jobInfo?.fName ?? ''} ${jobInfo?.mName ?? ''} ${jobInfo?.lName ?? ''}`,
          });


        } else {
          console.warn('No job info found for this employee.');
        }
      },
      error: (err: any) => {
        console.error('Error fetching job details:', err);
        this.loading = false;
      }
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data
        this.joiningDate = this.formatDateToLocal(data.dateOfJoining)
      },
      error: (reason: any) => console.error('Error fetching employee data:', reason),
    });
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
      this.getJobDetails();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
      this.getJobDetails();
    }
  }
  formatDateToLocal(dateString: string): string {

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //function to post the separation request form
  postSeparationRequestForm() {
    this.isLoading = true;
    const appliedDate = this.separationRequestForm.get('appliedDate')?.value;

    if (appliedDate) {
      this.onCheckNotiesperiod(appliedDate);
    }

    if (this.postSeparationRequest.isEarlyRelieving !== true) {
      (this.postSeparationRequest.reasonForEarlyRelieving = null),
        (this.postSeparationRequest.earlyRelievingDate = null);
    }
    let postData = {
      employeeId: this.postSeparationRequest.employeeId,
      appliedDate: this.separationRequestForm.get('appliedDate')?.value,
      description: this.separationRequestForm.get('description')?.value,
      lastWorkingDate: this.postSeparationRequest.lastworkingday,
      noticePeriodDuration: this.noticeperiodDuration,
      reasonForEarlyRelieving: this.separationRequestForm.get('reasonForEarlyRelieving')?.value,
      isEarlyRelieving: this.separationRequestForm.get('isEarlyRelieving')?.value,
      earlyRelievingDate: this.separationRequestForm.get('earlyRelievingDate')?.value,
      comments: null,
      status: 'Waiting for Approval',
      recallStatus: 'Separation',
      requestType: 'Separation',
      // recallStatus:'Request Raised',
      jobId: this.postSeparationRequest.id,
      moduleId: environment.SeparationrequestmoduleId,
    };
    this.subscription = this.http.postdata(`SeparationRequests`, postData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.separationRequestForm.reset();
          this.modalService.dismissAll(); // Close the modal
          this.conformationPopup.openSuccessModal('Separation request raised successfully');
          this.getSeparationRequest();
          this.webNotificationformanager();
          this.http.setseparationDetails()
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(err.error.message);
      },
    });
  }
  toggleEarlyRelievingFields(isEnabled: boolean): void {
    if (isEnabled) {
      this.separationRequestForm.get('earlyRelievingDate')?.enable();
      this.separationRequestForm.get('reasonForEarlyRelieving')?.enable();
    } else {
      this.separationRequestForm.get('earlyRelievingDate')?.disable();
      this.separationRequestForm.get('reasonForEarlyRelieving')?.disable();
    }
  }

  onCheckEarlyRelieving(): void {
    const isEarlyRelieving = this.separationRequestForm.get('isEarlyRelieving')?.value;
    if (!isEarlyRelieving) {
      this.separationRequestForm.get('earlyRelievingDate')?.reset();
      this.separationRequestForm.get('earlyRelievingDate')?.setErrors(null);

      this.separationRequestForm.get('reasonForEarlyRelieving')?.reset();
      this.separationRequestForm.get('reasonForEarlyRelieving')?.setErrors(null);
    }
    this.toggleEarlyRelievingFields(isEarlyRelieving);
  }
  //function to check the noticeperiod valid upto
  onCheckNotiesperiod(Value: any) {
    if (Value) {
      let noticePeriodValidupto = this.noticeperiodDuration;
      let currentDate = moment(Value);
      let futureDate = currentDate.add(noticePeriodValidupto, 'days');
      let formatedate = this.formatDate(futureDate);
      this.postSeparationRequest.lastworkingday = formatedate;
      console.log('lastworkingday', this.postSeparationRequest.lastworkingday);
    }
  }
  //function to get the separation request details
  getSeparationRequest() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`SeparationRequests/getbyemployeeId?Id=${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.substatus = data.map((application: { status: any; }) => application.status.toLowerCase());
        const seperationStatus1 = [
          'waiting for approval', 'approved', 'processed', 'early relieving processed', 'extended'
        ];
        this.status = seperationStatus1.some((value) =>
          this.substatus.includes(value),
        );
        this.checkStatus();
      }
    })
  }
  checkStatus() {
    if (this.status) {
      this.showSaperationDots = false;
    }
  }
  //function to send the web notification
  webNotificationformanager() {
    let currentDate = moment();
    let loggedInUser = this.authService.getToken();
    let webdata = {
      message: `"Separation Request"`,
      sentTo: loggedInUser.workEmail,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser.firstName ?? ''} ${loggedInUser.middleName ?? ''} ${loggedInUser.lastName ?? ''}  has raised the separation`,
      empId: loggedInUser.employeeId,
    };
    this.subscription = this.http.postdata(`Notification/Notify/Manager`, webdata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      },

    });
  }
  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
  }
  confirmationopenModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
  }
}

