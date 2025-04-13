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
import { Ipersonal, Iteammembers } from '../../interfaces/members-model';


@Component({
  selector: 'app-personalinfo-layout',
  imports: [CommonModule, RouterOutlet, Select, ProfileInfoDetailsComponent, PersonalPersonalTabsComponent, PersonalJobTabsComponent,FormsModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './personalinfo-layout.component.html',
  styleUrl: './personalinfo-layout.component.scss'
})
export class PersonalinfoLayoutComponent implements OnInit,OnDestroy{
  teamForm!: FormGroup;
  managers: any[] = [];
  teamMembersdata: any[] = [];
  TeamMemberArray: Iteammembers[] = [];
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  empinfo = {} as Ipersonal;
  subscription!: Subscription;
  emppersonalinfo={} as Ipersonal;
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

  constructor(private http: HttpService,private authService: AuthService,private router: Router, private modalService: NgbModal,private fb: FormBuilder,private conformationPopup: OpenModalService) { }
  
  ngOnInit(): void {
    this.teamForm = this.fb.group({
      teamMembers: [null, Validators.required],
      reportingManager: [null, Validators.required]
    });
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    console.log(this.empinfo);
    console.log(this.empdata);
    this.initializeForm();
    this.initialzerevoke();
    this.getAllTeammembersList();
    this.getEmployee();
    this.emppersonalinfo=JSON.parse(localStorage.getItem("personaldata") || '{}')
    this.getTraineeofferdetails();
    this.assignHeading();
    
    
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
    this.subscription = this.http
      .postdata(`CustomEmail/RequestDocuments`, pdata)
      .subscribe({
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
    console.log("Selected Value for", field, event.value);
    
    if (field === 'teamMembers') {
        this.selectedEmployees = Array.isArray(event.value) ? event.value : [event.value];
        this.selectedEmployeeIds = this.selectedEmployees.map(emp => emp.employeeId);
    }
    if (field === 'reportingManager') {
        this.teamForm.patchValue({
            reportingManager: event.value
        });
    }
    console.log("Updated selectedEmployees:", this.selectedEmployees);
    console.log("Updated selectedEmployeeIds:", this.selectedEmployeeIds);
}
navigateDashboard() {
  this.router.navigate(['/admin/dashboard'])
}
  getEmployee() {
    this.subscription = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
      next: (data: any) => {
        this.managers = data
          .filter((emp: { fusionEmpId: any }) => emp.fusionEmpId)
          .map((emp: { firstName: any; middleName?: string; lastName: any }) => ({
            ...emp,
            name: `${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`
          }));
      },
      error: (err: any) => console.log(err),
    });
  }

  getAllTeammembersList() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.teamMembersdata = data.map((member: any) => ({
          ...member,
          name: `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`
        }));
      },
      error: (err: any) => console.log(err),
      }
    );
}

updateTeamRM() {
  console.log("Raw Selected Employees:", this.selectedEmployees);
  console.log("Updated selectedEmployeeIds:", this.selectedEmployeeIds);

  if (!Array.isArray(this.selectedEmployees) || this.selectedEmployees.length === 0) {
    console.error("selectedEmployees is not a valid array", this.selectedEmployees);
    return;
  }

  let requestBody = this.selectedEmployees.map(employee => ({
    jobRole: employee.jobRole,
    firstName: employee.firstName,
    lastName: employee.lastName,
    middleName: employee.middleName ?? "",
    workEmail: employee.workEmail,
    fusionEmpId: employee.fusionEmpId,
    employeeId: employee.employeeId,
    contactnumber: employee.contactnumber,
    id: employee.id
  }));

  console.log("Final Request Payload:", JSON.stringify(requestBody, null, 2));

  const ManagerId = this.teamForm.value.reportingManager?.employeeId;
  if (!ManagerId) {
    console.error("No valid ManagerId found.");
    return;
  }

  this.subscription = this.http.postdata(`JobDetails/joblist/updater?ManagerId=${ManagerId}`, requestBody)
    .subscribe({
      next: (data: any) => {
        console.log("Update successful", data);
        this.conformationPopup.openSuccessModal('Updated Successfully');
        console.log(data);
      },
      error: (reason: any) => {
        console.log(reason);
      this.conformationPopup.openErrorModal('Updated Successfully');
      }
    });
}

showSuccessPopup() {
  this.pouptext1 = 'Reporting Manager updated successfully';
  const modalElement = document.getElementById('successhide');
  if (modalElement) {
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
  }
  setTimeout(() => location.reload(), 1500);
}

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
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
  formsubmit(){
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

close(){
  this.modalService.dismissAll();
  
}

onclose(){
  this.modalService.dismissAll();
  this.employeeForm.reset();
  this.revokeForm.reset();
}
  reRequestEmail(f:FormGroup) {
    let loggedInUser = this.authService.getToken();
    let pdata = {
      empId: this.empinfo.employeeId,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      status: this.postreason,
      comments: this.employeeForm.get('comments')?.value,
      // jobRole: this.selectedValueJobRoledrop,
    };
    if (loggedInUser.middleName) {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    this.subscription = this.http
      .postdata(`CustomEmail/RerequestDocuments`, pdata)
      .subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Email Sent Successfully')
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }
  submitArchive() {
    (this.empdata.empstatus = 'archived'),
      (this.empdata.substatus = 'Employee Created'),
      this.subscription = this.http
        .postdata(`Employeedata/UPDATER`, this.empdata)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.updateOnboardingStatus();
            this.conformationPopup.openSuccessModal('Employee archived successfully');
            // const modalElement2 = document.getElementById('commonall');
            // if (modalElement2) {
            //   modalElement2.classList.remove('show');
            //   modalElement2.style.display = 'none';
            // }
            // this.pouptext1 = 'Employee archived sucessfully';
            // const modalElement = document.getElementById('successhide1');
            // if (modalElement) {
            //   modalElement.classList.add('show');
            //   modalElement.style.display = 'block';
            // }

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
    this.subscription = this.http
      .postdata('JobApplicantsData/UPDATERbyEmployeeId', data)
      .subscribe({
        next: (data: any) => {
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal('Something went wrong');
          setTimeout(function () {
            // if (modalElement) {
            //   modalElement.classList.remove('show');
            // }
          }, 2000);
        },
      });
  }
  updatePassword() {
    const employeeId = this.empdata.employeeId;
    this.http
      .getData(`PreonboardingEmployeedata/regeneratePassword/${employeeId}`)
      .subscribe({
        next: (response: any) => {
          this.conformationPopup.openSuccessModal('Password updated successfully');
          setTimeout(function () {
            const modalElement = document.getElementById('successhide');
            if (modalElement) {
              modalElement.classList.remove('show');
              modalElement.style.display = 'none';
            }
          }, 2000);
        },
        error: (error: any) => {
          console.log(error);
          // Handle error
        },
        complete: () => {
          this.emailToEmployee();
        },
      });
  }
  emailToEmployee() {
    let data = {
      personName: `${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''
        } ${this.empdata.lastName ?? ''}`,
      personEmail: this.empdata.emailaddress,
      employeeId: this.empdata.employeeId,
    };
    this.http.postdata(`CustomEmail/generateCredentialEmail`, data).subscribe({
      next: (res: any) => {
        // window.location.reload();
      },
      error: (error: any) => {
        console.log(error);
        // Handle error
      },
      complete: () => {
        location.reload();
      },
    });
  }
  revokepopup() {
    
 }
 closerevolesubmit(){

 }
 submitrevoke() {
  (this.empdata.empstatus = 'Revoked'),
    (this.empdata.substatus = 'Offer Revoked'),
    (this.empdata.revokeComments = this.empdata.revokeComments);
  if (this.empdata.marriedDate == 'Invalid date') {
    this.empdata.marriedDate = null;
  }
  this.subscription = this.http
    .postdata(`Employeedata/UPDATER`, this.empdata)
    .subscribe({
      next: (data: any) => {
        this.revokeEmail();
        this.updateRevokeStatustooffer();
        this.revokeEmailToEmployee();
        this.updateOnboardingStatus();

        if (this.jobPostData.id) {
          this.updateJobapplicantdata();
        } else {

          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 3000);
        }
        this.conformationPopup.openSuccessModal('Offer Revoked Successfully');
        // const modalElement2 = document.getElementById('commonall');
        // if (modalElement2) {
        //   modalElement2.classList.remove('show');
        //   modalElement2.style.display = 'none';
        // }
        // this.pouptext1 = 'Offer Revoked';
        // const modalElement = document.getElementById('successhide1');
        // if (modalElement) {
        //   modalElement.classList.add('show');
        //   modalElement.style.display = 'block';
        // }

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
  this.subscription = this.http
    .postdata(`CustomEmail/revokeemailtomanager`, sdata)
    .subscribe({
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

  this.subscription = this.http
    .postdata(`CustomEmail/revokeemailtoemployee`, pdata)
    .subscribe({
      next: (data: any) => {

      },
      error: (err: any) => {
        console.log(err);
      },
    });
}
updateRevokeStatustooffer() {
  this.getOfferDetails.offerSentStatus = 'Revoked';
  this.subscription = this.http
    .postdata('OfferLetter/UPDATE', this.getOfferDetails)
    .subscribe({
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
  this.subscription = this.http
    .postdata('JobApplicantsData/UPDATER', data)
    .subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Offer Revoked Successfully');
        // this.pouptext1 = 'Offer Revoked';
        // const modalElement = document.getElementById('successhide1');
        // if (modalElement) {
        //   modalElement.classList.add('show');
        //   modalElement.style.display = 'block';
        // }
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
    console.log(EmpId);

    this.subscription = this.http.getData(`TraineeOfferLetter/${EmpId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getTraineeOfferDetails = data;
        console.log(this.getTraineeOfferDetails);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  onBackSubmit() {
    let routestatus = JSON.parse(localStorage.getItem('personaldata') || '{}');
    switch (routestatus.empstatus) {
      case 'Prospective':
        this.router.navigate(['/admin/prospective-employees'])
        break;
      case 'Active':
        this.router.navigate(['/admin/active-employees'])
        break;
      case 'Probation':
        this.router.navigate(['/admin/probationemployees'])
        break;
      case 'Inactive':
        this.router.navigate(['/admin/inactive-employees'])
        break;
      case 'Trainee Prospective':
        this.router.navigate(['/admin/prospective-interns'])
        break;
      case 'Trainee Active':
        this.router.navigate(['/admin/traineeactiveemployee'])
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

  assignHeading() {
    let routestatus = JSON.parse(localStorage.getItem('personaldata') || '{}');
    switch (routestatus.empstatus) {
      case 'Prospective':
        this.headerName = "Prospective Employees"
        break;
      case 'Active':
        this.headerName = "Active Employees"
        break;
      case 'Probation':
        this.headerName = "Probation Employees"
        break;
      case 'Inactive':
        this.headerName = "Inactive Employees"
        break;
      case 'Trainee Prospective':
        this.headerName = "Prospective Trainees"
        break;
      case 'Trainee Active':
        this.headerName = "Active Trainees"
        break;
      case 'Trainee Inactive':
        this.headerName = "Inactive Trainees"
        break;
      case 'External Prospective':
        this.headerName = "External Prospective "
        break;
      case 'External Active':
        this.headerName = "External Active "
        break;
      case 'External Inactive':
        this.headerName = "External Inactive"
        break;
      default:
        this.headerName = "Employees"
    }
  }
  navigation() {
    localStorage.setItem("offBoardingemplist", JSON.stringify(this.emppersonalinfo));

    this.router.navigate(['/personalinfo/job/employee-off-boarding']);

  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}