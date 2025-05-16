import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { ProfileInfoDetailsComponent } from '../../shared/profile-info-details/profile-info-details.component';
import { PersonalPersonalTabsComponent } from '../../shared/personalinfo-tabs/personal-personal-tabs/personal-personal-tabs.component';
import { PersonalJobTabsComponent } from '../../shared/personalinfo-tabs/personal-job-tabs/personal-job-tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import { Ipersonal, Iteammembers } from '../../Interfaces/members-model';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-personalinfo-layout',
  imports: [CommonModule, RouterOutlet, Select, ProfileInfoDetailsComponent, PersonalPersonalTabsComponent, PersonalJobTabsComponent,
    FormsModule, ReactiveFormsModule, TranslateModule, MultiSelectModule],
  templateUrl: './personalinfo-layout.component.html',
  styleUrl: './personalinfo-layout.component.scss'
})

export class PersonalinfoLayoutComponent implements OnInit, OnDestroy {
  teamForm!: FormGroup;
  managers: any[] = [];
  teamMembersdata: any[] = [];
  TeamMemberArray: Iteammembers[] = [];
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  empinfo = {} as Ipersonal;
  subscription!: Subscription;
  emppersonalinfo = {} as Ipersonal;
  employeeForm!: FormGroup;
  revokeForm!: FormGroup;
  postIsApplicable!: any;
  postreason!: any;
  empdata = {} as any;
  selectedData: any = {};
  selectedEmployeeIds: any;
  pouptext1: any
  selectedManager: any = null;
  jobPostData: any;
  headerName!: string;
  isLoading: boolean = false;
  showBackIcon: boolean = true;
  spinnerLoader = false;
  loginEmployee = {} as any;
  constructor(private http: HttpService, private authService: AuthService, private router: Router, private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.teamForm = this.fb.group({
      teamMembers: [null, Validators.required],
      reportingManager: [null, Validators.required]
    });
    this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.loginEmployee = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.initializeForm();
    this.initialzerevoke();
    this.getEmployeeId();
    this.getAllTeammembersList();
    this.getEmployee();
    this.emppersonalinfo = JSON.parse(localStorage.getItem("personaldata") || '{}')
    this.getTraineeofferdetails();
    this.assignHeading();
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  emailForRequestDoc() {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    if (this.emppersonalinfo.experienceType == 'Fresher') {
      this.postIsApplicable = 'Fresher';
    } else if (this.emppersonalinfo.experienceType == 'Trainee') {
      this.postIsApplicable = 'Trainee';
    } else if (this.emppersonalinfo.experienceType == 'Experienced') {
      this.postIsApplicable = 'Experienced';
    }
    let pdata = {
      empId: this.emppersonalinfo.employeeId,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      status: this.postIsApplicable,
    };
    if (loggedInUser.middleName) {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    this.subscription = this.http.postdata(`CustomEmail/RequestDocuments`, pdata).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Email Sent Successfully')
        this.isLoading = false;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  onSelectManager(event: any, field: string) {
    if (field === 'teamMembers') {
      this.selectedEmployees = Array.isArray(event.value) ? event.value : [event.value];
      this.selectedEmployeeIds = this.selectedEmployees.map(emp => emp.employeeId);
    }
    if (field === 'reportingManager') {
      this.teamForm.patchValue({ reportingManager: event.value });
    }
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  getEmployee() {
    this.subscription = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
      next: (data: any) => {
        this.managers = data.filter((emp: { fusionEmpId: any }) => emp.fusionEmpId)
          .map((emp: {fusionEmpId:string; firstName: any; middleName?: string; lastName: any }) => ({
            ...emp,
            name: `${emp.fusionEmpId} - ${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`
          }));
      },
      error: (err: any) => console.log(err),
    });
  }

  getAllTeammembersList() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/v1/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.teamMembersdata = data.map((member: any) => ({
          ...member,
          name: `${member.fusionEmpId} - ${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`
        }));
      },
      error: (err: any) => console.log(err),
    }
    );
  }

 

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' , size: 'lg' });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  selectedEmployees: any[] = []; // Ensure it's an array
  formatEmployeeName(employee: any): string {
    const nameParts = [];
    if (employee.firstName) {
      nameParts.push(employee.firstName);
    }
    if (employee.middleName) {
      nameParts.push(employee.middleName);
    }
    if (employee.lastName) {
      nameParts.push(employee.lastName);
    }
    return nameParts.join(' ');
  }

  firstSelectedEmployee: Iteammembers | null = null;
  getSelectedTeamMembersLabel(): string {
    const selectedCount = this.selectedEmployees.length;
    if (selectedCount === 0) {
      return 'Select Team Members';
    } else if (selectedCount === 1) {
      return this.formatEmployeeName(this.firstSelectedEmployee);
    } else {
      return `${this.formatEmployeeName(this.firstSelectedEmployee)} +${selectedCount - 1}`;
    }
  }

  formsubmit() {
    this.teamForm = this.fb.group({
      teamMembers: [null, Validators.required],
      reportingManager: [null, Validators.required]
    });
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  close() {
    this.modalService.dismissAll();
  }

  onclose() {
    this.modalService.dismissAll();
    this.employeeForm.reset();
    this.revokeForm.reset();
  }

  reRequestEmail(f: FormGroup) {
    let loggedInUser = this.authService.getToken();
    let pdata = {
      empId: this.empinfo.employeeId,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      status: this.postreason,
      comments: this.employeeForm.get('comments')?.value,
    };
    if (loggedInUser.middleName) {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    this.subscription = this.http.postdata(`CustomEmail/RerequestDocuments`, pdata).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Email Sent Successfully')
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  submitArchive() {
    (this.empdata.empstatus = 'Archived'),
      (this.empdata.substatus = 'Employee Created'),
      this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.empdata).subscribe({
        next: (data: any) => {
          this.getEmployeeId();
          this.updateOnboardingStatus();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Employee archived successfully');
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 3000);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  updateOnboardingStatus() {
    let data = {
      status: 'Revoked',
      employeeId: this.empdata.employeeId,
    };
    this.subscription = this.http.postdata('JobApplicantsData/UPDATERbyEmployeeId', data).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal('Something went wrong');
        setTimeout(function () {
        }, 2000);
      },
    });
  }

  updatePassword() {
    const employeeId = this.empdata.employeeId;
    this.http.getData(`PreonboardingEmployeedata/regeneratePassword/${employeeId}`).subscribe({
      next: (response: any) => {
        this.conformationPopup.openSuccessModal('Password updated successfully');
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        this.emailToEmployee();
      },
    });
  }

  emailToEmployee() {
    let data = {
      personName: `${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''} ${this.empdata.lastName ?? ''}`,
      personEmail: this.empdata.emailaddress,
      employeeId: this.empdata.employeeId,
    };
    this.http.postdata(`CustomEmail/generateCredentialEmail`, data).subscribe({
      next: (res: any) => {
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        location.reload();
      },
    });
  }

  submitrevoke() {
    (this.empdata.empstatus = 'Revoked'),
      (this.empdata.substatus = 'Offer Revoked'),
      (this.empdata.revokeComments = this.empdata.revokeComments);
    if (this.empdata.marriedDate == 'Invalid date') {
      this.empdata.marriedDate = null;
    }
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.empdata).subscribe({
      next: (data: any) => {
        if (data) {
          this.getEmployeeId();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Offer Revoked Successfully');
          this.revokeEmail();
          this.updateRevokeStatustooffer();
          this.revokeEmailToEmployee();
          this.updateOnboardingStatus();
          if (this.jobPostData.id) {
            this.updateJobapplicantdata();
          }
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 3000);
        }

      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  revokeEmail() {
    let loggedInUser = this.authService.getToken();
    let sdata = {
      personName: `${this.empdata?.firstName} ${this.empdata?.middleName} ${this.empdata?.lastName}`,
      personEmail: 'string',
      personRole: 'string',
      employeeId: loggedInUser.employeeId,
      documentUrl: 'string',
      workLocation: 'string',
      senderName: 'string',
      senderEmail: 'string',
      approvedBy: 0,
      approvedByName: 'string',
      firstName: 'string',
      lastName: 'string',
      middleName: 'string',
      comments: this.empdata.revokeComments,
      offerStartDate: '2023-12-24T17:33:45.271Z',
      offerExpiryDate: '2023-12-24T17:33:45.271Z',
    };
    if (this.empdata.middleName) {
      sdata.personName = `${this.empdata?.firstName} ${this.empdata?.middleName} ${this.empdata?.lastName}`;
    } else {
      sdata.personName = `${this.empdata?.firstName} ${this.empdata?.lastName}`;
    }
    this.subscription = this.http.postdata(`CustomEmail/revokeemailtomanager`, sdata).subscribe({
      next: (data: any) => {
      },
      error: (err: any) => {
      },
    });
  }

  //function to send email to employee
  revokeEmailToEmployee() {
    let pdata = {
      empId: this.empinfo.employeeId,
      userName: 'string',
      password: 'string',
      personEmail: this.empinfo.emailaddress,
      personName: 'string',
      senderName: 'string',
      senderEmail: 'string',
      jobRole: 'string',
      comments: this.empdata.revokeComments,
    };
    this.subscription = this.http.postdata(`CustomEmail/revokeemailtoemployee`, pdata).subscribe({
      next: (data: any) => { },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  updateRevokeStatustooffer() {
    this.getOfferDetails.offerSentStatus = 'Revoked';
    this.subscription = this.http.postdata('OfferLetter/UPDATE', this.getOfferDetails).subscribe({
      next: (data: any) => {
        if (data.offerSentStatus == 'Revoked') {
          this.revokeEmailToEmployee();
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getOfferDetails = {} as any;
  getofferdetails() {
    let EmpId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`OfferLetter/${EmpId}`).subscribe({
      next: (data: any) => {
        this.getOfferDetails = data;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  updateJobapplicantdata() {
    const empData = JSON.parse(localStorage.getItem('personaldata') || '{}');
    const data = {
      status: "Revoked",
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
    this.subscription = this.http.postdata('JobApplicantsData/UPDATER', data).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Offer Revoked Successfully');
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 3000)
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  initialzerevoke() {
    this.revokeForm = this.fb.group({
      revokeComments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  getTraineeOfferDetails = {} as any;
  getTraineeofferdetails() {
    let EmpId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`TraineeOfferLetter/${EmpId}`).subscribe({
      next: (data: any) => {
        this.getTraineeOfferDetails = data;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  onBackSubmit() {
    let routestatus = JSON.parse(localStorage.getItem('personaldata') || '{}');
    if (routestatus.empType === 'Probation') {
      this.router.navigate(['/admin/probation-employees']);
    } else {
      switch (routestatus.empstatus) {
        case 'Prospective':
          this.router.navigate(['/admin/prospective-employees'])
          break;
        case 'Active':
          this.router.navigate(['/admin/active-employees'])
          break;
        case 'Probation':
          this.router.navigate(['/admin/probation-employees'])
          break;
        case 'Inactive':
          this.router.navigate(['/admin/inactive-employees'])
          break;
        case 'Trainee Prospective':
          this.router.navigate(['/admin/prospective-interns'])
          break;
        case 'Trainee Active':
          this.router.navigate(['/admin/active-interns'])
          break;
        case 'Trainee Inactive':
          this.router.navigate(['admin/inactive-interns'])
          break;
        case 'External Prospective':
          this.router.navigate(['/admin/externalprospective-employee'])
          break;
        case 'External Active':
          this.router.navigate(['/admin/externalactive-employee'])
          break;
        case 'External Inactive':
          this.router.navigate(['/admin/externalinactive-employee'])
          break;
        default:
          this.router.navigate(['/admin'])
      }
    }
  }

 assignHeading() {
  const currentPath = this.router.url;

  if (currentPath.startsWith('/personalinfo')) {
    this.headerName = "Employee Information";
    this.showBackIcon = false;  // Hide back icon for personalinfo
    return; // Important: stop here so admin logic does NOT run
  }

  // Now we know route is NOT personalinfo, so we check admin logic
  if (currentPath.startsWith('/admin')) {
    this.showBackIcon = true; // Show back icon for admin
    let routestatus = JSON.parse(localStorage.getItem('personaldata') || '{}');

    if (routestatus.empType === 'Probation') {
      this.headerName = "Probation Employees";
    } else {
      switch (routestatus.empstatus) {
        case 'Prospective':
          this.headerName = "Prospective Employees";
          break;
        case 'Active':
          this.headerName = "Active Employees";
          break;
        case 'Probation':
          this.headerName = "Probation Employees";
          break;
        case 'Inactive':
          this.headerName = "Inactive Employees";
          break;
        case 'Trainee Prospective':
          this.headerName = "Prospective Trainee";
          break;
        case 'Trainee Active':
          this.headerName = "Active Trainee";
          break;
        case 'Trainee Inactive':
          this.headerName = "Inactive Trainee";
          break;
        case 'External Prospective':
          this.headerName = "External Prospective";
          break;
        case 'External Active':
          this.headerName = "External Active";
          break;
        case 'External Inactive':
          this.headerName = "External Inactive";
          break;
        default:
          this.headerName = "Employees";
      }
    }
  }
}

  

  navigation() {
    localStorage.setItem("offBoardingemplist", JSON.stringify(this.emppersonalinfo));
    this.router.navigate(['/personalinfo/job/employee-off-boarding']);
  }

  resetAndClose(modal: any): void {
    this.teamForm.reset();
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    localStorage.removeItem('personaldata')
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}