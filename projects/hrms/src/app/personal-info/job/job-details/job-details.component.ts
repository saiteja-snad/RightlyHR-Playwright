import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IDepartment, IGrade, IJob, IJobdetails, IJobtype, IRole } from '../../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-job-details',
  imports: [CommonModule, Select,ReactiveFormsModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
  separationRequestForm!: FormGroup;
  jobdetails: IJobdetails[] = [];
  selectedDepartmentId: number = 0;
  jobDetailsForm!: FormGroup;
  subscription!: Subscription;
  empinfo: any;
  departmentDetails: any;
  JobroleDetails: any;
  JobtypeDetails: any;
  employeinfo: any
  allempdata: any;
  allReportees: any;
  GradeDetails = [] as IGrade[];
  employeementType: { id: number; name: string }[] = [
    { id: 1, name: 'Full-Time' },
    { id: 2, name: 'Part-Time' },
    { id: 3, name: 'Contract' },
    { id: 4, name: 'Internship' }
  ];

  designation: { id: number; name: string }[] = [
    { id: 1, name: 'Software Engineer' },
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'HR Executive' },
    { id: 4, name: 'Data Analyst' }
  ];

  location: { id: number; name: string }[] = [
    { id: 1, name: 'New York' },
    { id: 2, name: 'Los Angeles' },
    { id: 3, name: 'Chicago' },
    { id: 4, name: 'Houston' }
  ];

  sublocation: { id: number; name: string; locationId: number }[] = [
    { id: 1, name: 'Brooklyn', locationId: 1 },
    { id: 2, name: 'Downtown', locationId: 1 },
    { id: 3, name: 'Hollywood', locationId: 2 },
    { id: 4, name: 'South Side', locationId: 3 }
  ];
  subDepartmentsDropdownValues: any;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.initializejobForm();
    this.getDepartment();
    this.getJobtype();
    this.getReportingTo();
    this.getEmployeeId();
    this.getGrade();
   // this.getSubDepartmentName();  
    this.getJobrole();  
      this.getJobDetails();
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
  }

  initializeForm(): void {
    this.separationRequestForm = this.fb.group({
      appliedDate: ['', Validators.required],
      jobRole: [{ value: '', disabled: true }],
      departmentName: [{ value: '', disabled: true }],
      subdepartmentName: [{ value: '', disabled: true }],
      teamManager: [{ value: '', disabled: true }],
      reportingManager: [{ value: '', disabled: true }],
      description: ['', [Validators.required, Validators.maxLength(400)]],
      isEarlyRelieving: [false],
      earlyRelievingDate: ['', Validators.required],
      reasonForEarlyRelieving: ['', [Validators.required, Validators.maxLength(400)]]
    });

    // Disable early relieving fields by default
    this.toggleEarlyRelievingFields(false);
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
    this.toggleEarlyRelievingFields(isEarlyRelieving);
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
       
      },
      error: (reason:any) => console.error('Error fetching employee data:', reason),
    });
  }
  //function to get grade dropdown
  getGrade() {
    this.subscription = this.http.getData('GradeTable').subscribe({
      next: (data: any) => {
        console.log(data);
        this.GradeDetails = data as IGrade[];
      },
    });
  }

  initializejobForm(): void {
    this.jobDetailsForm = this.fb.group({
      effectiveDate: ['', Validators.required],
      jobRole: ['', Validators.required],
      grade: ['', Validators.required],
      department: ['', Validators.required],
      team: ['', Validators.required],
      teamManager: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      shift: ['', Validators.required],
      jobType: ['', Validators.required],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  onSubmit(): void {
    if (this.jobDetailsForm.valid) {
      console.log('Form Submitted:', this.jobDetailsForm.value);
    }
  }



  allDepartments: any; //array to store all the departments
  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data as IDepartment[];
        this.allDepartments = this.departmentDetails.map(
          (item: { departmentName: any; }) => item.departmentName
        );
      },
    });
  }
  AllJobRoles: any; //array to store all the jobroles
  getJobrole() {
    this.subscription = this.http.getData('JobRole').subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobroleDetails = data as IRole[];
        this.AllJobRoles = this.JobroleDetails.map((item: { jobRole1: any; }) => item.jobRole1);
      },
    });
  }

  //function to get jobtype dropdown
  getJobtype() {
    this.subscription = this.http.getData('Jobtype').subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobtypeDetails = data as IJobtype[];
      },
    });
  }

  getReportingTo() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.allempdata = data as IJob[];
          console.log(this.allempdata);
          this.allReportees = this.allempdata.map(
            (employee: { firstName: string; lastName: string }) => `${employee.firstName} ${employee.lastName}`
          );

          console.log(this.allReportees);
        },
      });
  }


  // onDepartmentNameChange() {
  //   console.log(this.selectedDepartmentId);
  //   this.subscription = this.http
  //     .getData(`Subdepartments/Getnames/${this.selectedDepartmentId}`)
  //     .subscribe({
  //       next: (data: any) => {
  //         this.subDepartmentsDropdownValues = data;
  //         console.log(this.subDepartmentsDropdownValues);
  //       },
  //       complete: () => {},
  //     });
  //   this.isDepartmentSelected = false;
  //   this.selectedReportingManagerName = '';
  // }
  // selectedDepartmentId(selectedDepartmentId: any) {
  //   throw new Error('Method not implemented.');
  // }
  // onSubDepartmentNameChange() {
  //   console.log(this.selectedSubDepartmentId);
  //   this.subscription = this.http
  //     .getData(`Subdepartments/${this.selectedSubDepartmentId}`)
  //     .subscribe({
  //       next: (data: any) => {
  //         this.subdeparmentSingleobj = data;
  //         console.log(this.subdeparmentSingleobj);
  //         this.selectedReportingManagerId =
  //           this.subdeparmentSingleobj[0].reportingmanagerId;
  //         console.log(this.selectedReportingManagerId);

  //         this.selectedReportingManagerName =
  //           this.subdeparmentSingleobj[0].firstName +
  //           ' ' +
  //           this.subdeparmentSingleobj[0].lastName;
  //         console.log(this.selectedReportingManagerName);
  //       },
  //     });
  // }



  postJobDetails(): void {
    if (this.jobDetailsForm.valid) {
      const postJobDetails = {
        ...this.jobDetailsForm.value, // Get all form values
        employeeId: parseInt(this.empinfo.employeeId), // Add employee ID from `empinfo`
        status: 'Active', // Set status to 'Active'
      };
  
      console.log('Job Details to Submit:', postJobDetails);
  
      this.subscription = this.http.postdata('JobDetails', postJobDetails).subscribe({
        next: (data: any) => {
          console.log('Response:', data);
          if (data) {
            this.getJobDetails(); // Refresh job details
            this.conformationPopup.openSuccessModal('Data added successfully');
            this.jobDetailsForm.reset(); // Reset the form
            this.modalService.dismissAll(); // Close the modal if applicable
          }
        },
        error: (reason: any) => {
          console.error('Error:', reason);
          this.conformationPopup.openErrorModal('Insertion of data failed');
        },
      });
    } else {
      // Show error message if form is invalid
      this.conformationPopup.openErrorModal('Please fill in all required fields. Details not submitted');
      this.jobDetailsForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }


  getJobDetails() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);

    this.subscription = this.http
      .getData(`JobDetails/Empname/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.jobdetails = data as IJobdetails[];
          console.log(this.jobdetails);
        },
      });
  }
}
