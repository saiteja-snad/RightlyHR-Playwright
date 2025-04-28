import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IDepartment, IGrade, IJob, IJobtype, IRole } from '../../../Interfaces/job-model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import moment from 'moment';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../services/form-validations.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-job-details',
  imports: [CommonModule, TranslateModule, Select, ReactiveFormsModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})

export class JobDetailsComponent implements OnInit, OnDestroy {
  separationRequestForm!: FormGroup;
  jobDetailsupdateForm!: FormGroup;
  jobdetails = new BehaviorSubject<any[]>([]);
  teamDropdownValues: any[] = [];
  teamManagerDropdownValues: any[] = [];
  selectedDepartmentId: number = 0;
  jobDetailsForm!: FormGroup;
  subscription!: Subscription;
  empinfo: any;
  departmentDetails = [] as IDepartment[];
  JobroleDetails: any;
  JobtypeDetails = [] as IJobtype[];
  employeinfo: any
  allempdata: any;
  allReportees: any;
  selectedJobRoleObj: any; // To store the selected job role object
  teamManagerName: string = ''; // To store the team manager name
  shiftDropdowns: any = []; // To store the dynamically fetched shifts
  selectedData = {} as any; // To store the selected job details data for updating
  empdata: {
    id?: number;
    employeeId?: number;
    effectiveDate?: string;
    reportsto?: string;
    department?: string;
    bussinessArea?: string;
    lopcation?: string;
    jobRole?: string;
  } = {};
  noticeperiodDuration: any;
  selectedEmployeeId: any
  selectedGradeName: string = '';
  getGradename: any
  GradeDetails = [] as IGrade[];
  subDepartmentsDropdownValues: any = [];
  subdeparmentSingleobj: any;
  jobLocationDropDownData: any = [];
  JobroleDesignation = [] as IRole[];
  showSaperationDots = true;
  teammangerid: any;
  getGradeid: any;
  selectedjobdetailesid = {} as any;
  postSeparationRequest = {} as any;
  status: any
  substatus: any
  isLoading = false;
  joiningDate: any;

  constructor(private modalService: NgbModal, private authService: AuthService, private fb: FormBuilder, private conformationPopup: OpenModalService,
     private http: HttpService, public formValidations: FormValidationsService,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.joiningDate = this.formatDateToLocal(this.empinfo.dateOfJoining)
    this.initializeForm();
    this.initializejobForm();
    this.initializeupdatejobForm();
    this.getDepartment();
    this.getJobtype();
    this.getReportingTo();
    this.getEmployeeId();
    this.getjobLocationList();
    this.getJobDetails();
    this.getJobDesignation();
    this.getnoticePeriodData();
    this.getSeparationRequest();
  }

  initializejobForm(): void {
    this.jobDetailsForm = this.fb.group({
      effectiveDate: ['', Validators.required],
      jobRole: ['', Validators.required],
      grade: [{ value: null, disabled: true }, Validators.required],
      department: ['', Validators.required],
      team: ['', Validators.required],
      teamManager: [{ value: null, disabled: true }, Validators.required],
      reportingManager: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      shift: ['', Validators.required],
      jobType: ['', Validators.required],
    });
  }

  initializeupdatejobForm(): void {
    this.jobDetailsupdateForm = this.fb.group({
      effectiveDate: [null, Validators.required],
      jobRole: [null, Validators.required],
      grade: [{ value: null, disabled: true }, Validators.required],
      department: [null, Validators.required],
      team: [null, Validators.required],
      teamManager: [{ value: null, disabled: true }, Validators.required],
      reportingManager: [null, Validators.required],
      location: [null, Validators.required],
      subLocation: [null, Validators.required],
      shiftName: [null, Validators.required],
      jobType: [null, Validators.required],
    });
  }

  initializeForm(): void {
    this.separationRequestForm = this.fb.group({
      appliedDate: [null, Validators.required],
      jobRole: [{ value: null, disabled: true }],
      departmentName: [{ value: '', disabled: true }],
      team: [{ value: null, disabled: true }],
      teamManager: [{ value: null, disabled: true }],
      reportingManager: [{ value: '', disabled: true }],
      description: [null, [Validators.required, Validators.maxLength(400), Validators.pattern(/^(?!\s).*$/)]],
      isEarlyRelieving: [false],
      earlyRelievingDate: [null, Validators.required],
      reasonForEarlyRelieving: [null, [Validators.required, Validators.maxLength(400), Validators.pattern(/^(?!\s).*$/)]]
    });
    // Disable early relieving fields by default
    this.toggleEarlyRelievingFields(false);
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
      notificationType: `${loggedInUser.firstName ?? ''} ${loggedInUser.middleName ?? '' } ${loggedInUser.lastName ?? ''}  has raised the separation`,
      empId: loggedInUser.employeeId,
    };
    this.subscription = this.http.postdata(`Notification/Notify/Manager`, webdata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => { },
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
    this.toggleEarlyRelievingFields(isEarlyRelieving);
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => console.error('Error fetching employee data:', reason),
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      }
    });
  }

  onDepartmentChange(selectedDepartment: any): void {
    const selectedDepartmentId = selectedDepartment.sno; // Get the sno of the selected department
    // Fetch the teams based on the selected department ID
    this.subscription = this.http.getData(`Subdepartments/Getnames/${selectedDepartmentId}`).subscribe({
      next: (data: any) => {
        if (data) {
          this.teamDropdownValues = data; // Update the team dropdown values
        } else {
          this.teamDropdownValues = []; // Reset if no teams are found
        }
        this.jobDetailsForm.patchValue({ team: null }); // Reset the team selection
      },
      error: (err: any) => {
        this.teamDropdownValues = []; // Reset on error
        this.jobDetailsForm.patchValue({ team: null }); // Reset the team selection
      }
    });
  }

  //function to get jobtype dropdown
  getJobtype() {
    this.subscription = this.http.getData('Jobtype').subscribe({
      next: (data: any) => {
        this.JobtypeDetails = data as IJobtype[];
      },
    });
  }

  getReportingTo(): void {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.allempdata = data as IJob[];
        // Map the employee data to the format required by p-select
        this.allReportees = this.allempdata.map((employee: { employeeId: number; firstName: string; lastName: string, fusionEmpId: any }) => ({
          id: employee.employeeId, // Use the employeeId as the unique identifier
          employee: ` ${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''} ${employee.lastName ?? ''}`, // Combine first and last name
        }));
      },
      error: (err: any) => {
        this.allReportees = []; // Reset on error
      },
    });
  }

  // Method to handle selection of a reporting manager
  onReportingManagerChange(selectedManager: any): void {
    this.selectedEmployeeId = selectedManager?.id; // Store the selected employee ID
  }

  onSubDepartmentNameChange(selectedSubDepartment: any): void {
    const selectedSubDepartmentId = selectedSubDepartment.subdepartmentId; 
    
    this.subscription = this.http.getData(`Subdepartments/${selectedSubDepartmentId}`).subscribe({
      next: (data: any) => {
        this.subdeparmentSingleobj = data;
        // Update the team manager dropdown values
        this.teamManagerDropdownValues = this.subdeparmentSingleobj.map((manager: any) => ({
          id: manager.reportingmanagerId,
          name: manager.middleName ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
            : `${manager.firstName} ${manager.lastName}` || '',
        }));
        this.teammangerid = this.teamManagerDropdownValues[0].id; // Set the default team manager ID
        // Reset the team manager selection
        this.jobDetailsForm.patchValue({ teamManager: this.teamManagerDropdownValues[0].name });
        this.jobDetailsupdateForm.patchValue({ teamManager: this.teamManagerDropdownValues[0].name });
      },
      error: (err: any) => {
        this.teamManagerDropdownValues = []; // Reset on error
        this.jobDetailsForm.patchValue({ teamManager: null }); // Reset the team manager selection
      },
    });
  }

  onSubDepartmentNameChangeupdate(selectedSubDepartment: any): void {
    const selectedSubDepartmentId = selectedSubDepartment.subdepartmentId; 
    
    this.subscription = this.http.getData(`Subdepartments/${selectedSubDepartmentId}`).subscribe({
      next: (data: any) => {
        this.subdeparmentSingleobj = data;
        // Update the team manager dropdown values
        this.teamManagerDropdownValues = this.subdeparmentSingleobj.map((manager: any) => ({
          id: manager.reportingmanagerId,
          name: manager.middleName ? `${manager.firstName || ''} ${manager.middleName || ''} ${manager.lastName || ''}`
            : `${manager.firstName} ${manager.lastName}` || '',
        }));
        this.teammangerid = this.teamManagerDropdownValues[0].id; // Set the default team manager ID
        // Reset the team manager selection
       
        this.jobDetailsupdateForm.patchValue({ teamManager: this.teamManagerDropdownValues[0].name });
      },
      error: (err: any) => {
        this.teamManagerDropdownValues = []; // Reset on error
        this.jobDetailsupdateForm.patchValue({ teamManager: null }); // Reset the team manager selection
      },
    });
  }

  onDepartmentNameChange() {
    this.subscription = this.http.getData(`Subdepartments/Getnames/${this.selectedDepartmentId}`).subscribe({
      next: (data: any) => {
        this.subDepartmentsDropdownValues = data;
      },
      complete: () => { },
    });
  }

  getJobDesignation() {
    this.subscription = this.http.getData('DesignationGradeMapper?sort=designationName').subscribe({
      next: (data: any) => {
        this.JobroleDesignation = data as IRole[];
      },
      error: () => {
        console.error('Error fetching job designations');
      },
    });
  }

  onDesignationChange(selectedDesignation: any): void {
    // Find the selected designation in the JobroleDesignation array
    const designation = this.JobroleDesignation.find(
      (item) => item.id === selectedDesignation.id
    );
    this.getGradeid = designation?.gradeId; // Store the selected grade ID
    if (designation) {
      this.jobDetailsForm.patchValue({ grade: designation.gradeId }); // Update the grade in the form
      // Call the API to fetch the grade name based on gradeId
      this.getGradeNameById(designation.gradeId);
    } else {
      this.selectedGradeName = ''; // Reset if no designation is found
      this.jobDetailsForm.patchValue({ grade: '' });
    }
  }

  getGradeNameById(gradeId: number): void {
    this.subscription = this.http.getData(`GradeTable/getbyid/${gradeId}`).subscribe({
      next: (data: any) => {
        this.selectedGradeName = data.gradeName;
        // Patch the grade name into the form
        this.jobDetailsForm.patchValue({ grade: this.selectedGradeName });
      },
      error: (err: any) => {
        this.selectedGradeName = ''; // Reset the grade name on error
        // Reset the grade field in the form
        this.jobDetailsForm.patchValue({ grade: '' });
      },
    });
  }

  //function to get joblocations in to a dropdown 
  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data
      }
    })
  }

  subLocationsDropdown: any = [] // To store the dynamically fetched sub-locations
  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.subLocationsDropdown = []; // Reset if no sub-locations are found
          } else {
            this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
          }
          // Reset the sub-location selection in the form
          this.jobDetailsForm.patchValue({ subLocation: null });
        },
        error: (err: any) => {
          this.subLocationsDropdown = []; // Reset on error
          this.jobDetailsForm.patchValue({ subLocation: null }); // Reset the sub-location field
        },
      });
    } else {
      this.subLocationsDropdown = []; // Reset if no location is selected
      //this.jobDetailsForm.patchValue({ subLocation: null }); // Reset the sub-location field
    }
  }

  shiftDropdown: any[] = []; // To store the dynamically fetched shifts
  getShiftBYid(selectedSubLocation: any): void {
    if (selectedSubLocation && selectedSubLocation.id) {
      const locationId = this.jobDetailsForm.get('location')?.value?.id ?? this.jobDetailsForm.get('location')?.value; // Get the selected location ID
      const subLocationId = selectedSubLocation.id; // Get the selected sub-location ID
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.shiftDropdown = []; // Reset if no shifts are found
          } else {
            this.shiftDropdown = [].concat(...data.map((element: any) => element.orgShiftsItems)); // Flatten the shift data
          }
        },
        error: (err: any) => {
          this.shiftDropdown = []; // Reset on error
        },
      });
    } else {
      this.shiftDropdown = []; // Reset if no sub-location is selected
    }
  }

  postJobDetails(): void {
    const currentDate = new Date().toISOString();
    if (this.jobDetailsForm.valid) {
      const playload = {
        jobRole: this.jobDetailsForm.get('jobRole')?.value?.designationName, // Job Role from the form
        employeeId: parseInt(this.empinfo.employeeId), // Employee ID from `empinfo`
        subdeptId: this.jobDetailsForm.get('team')?.value?.subdepartmentId, // Sub-department ID from the selected team
        status: 'Active', // Set status to 'Active'
        reportsTo: this.selectedEmployeeId,
        teamManagerId: this.teammangerid, // Team Manager ID
        gradeId: this.getGradeid, // Grade ID
        jobTypeId: parseInt(this.jobDetailsForm.get('jobType')?.value?.sno), // Job Type ID
        locationId: this.jobDetailsForm.get('location')?.value?.id, // Location ID
        subLocationId: this.jobDetailsForm.get('subLocation')?.value?.id, // Sub-location ID
        shiftId: this.jobDetailsForm.get('shift')?.value?.id, // Shift ID
        effectiveDate: this.jobDetailsForm.get('effectiveDate')?.value, // Effective Date,
        createdAt: currentDate,
        updatedAt: currentDate,
      };
      this.subscription = this.http.postdata('JobDetails', playload).subscribe({
        next: (data: any) => {
          this.jobDetailsForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Job Details added successfully');
          this.getJobDetails(); // Refresh job details
        },
        error: (reason: any) => {
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
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobdetails.next(data);
        console.log(this.jobdetails.value);
        
      },
    });
  }
  formatDateToLocal(dateString: string): string {
   
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  openModalupdate(content: any, data: any): void {
    console.log(data.departmentId)
    const locationId = data?.locationId; // Get the location ID from the selected job details
    const subLocationId = data?.subLocationId; // Get the sub-location ID from the selected job details
    this.selectedjobdetailesid = data?.id;
    this.selectedData = data; // Store the selected job details data for updating
    console.log('Selected Job Details ID:', data);
    this.teamManagerName = data?.firstName + ' ' + data?.middleName + ' ' + data?.lastName
    const effectiveDate = this.formatDateToLocal(data.effectiveDate); // Format the effective date
    this.selectedJobRoleObj = this.JobroleDesignation.find(role => role.designationName === data.jobRole);
    this.jobDetailsupdateForm.patchValue({
      effectiveDate: effectiveDate,
      jobRole: this.selectedJobRoleObj,
      location: this.jobLocationDropDownData.find(
        (location: { jobLocationName: any; }) => location.jobLocationName === data.locationName
      ),
      department: this.departmentDetails?.find(
        dept => dept.departmentName === data?.departmentName
      ),
      team: this.teamDropdownValues?.find(
        team => team.subdepartmentName === data?.subdepartmentName
      ),
    
      
      teamManager: this.teamManagerName,
      jobType: this.JobtypeDetails.find(jt => jt.jobType1 === data.jobTypeName),
      reportingManager: this.allReportees.find((report: { id: any; employee: any }) => report.id === data.reportingmanagerId),
      grade: this.selectedJobRoleObj?.gradeName,
    });
    this.subscription = this.http.getData(`Subdepartments/Getnames/${data?.departmentId}`).subscribe({
      next: (teamData: any) => {
        this.teamDropdownValues = teamData || [];
        this.teamManagerDropdownValues = this.teamDropdownValues.map((manager: any) => ({
          id: manager.reportingmanagerId,
          teamManager: manager.middleName ? `${manager.firstName} ${manager.middleName} ${manager.lastName}` 
          : `${manager.firstName} ${manager.lastName}`,
        }));
        this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${locationId}`).subscribe({
          next: (res: any) => {
            if (!res?.jobSubLocations || res.jobSubLocations.length === 0) {
              this.subLocationsDropdown = []; // Reset if no sub-locations are found
            } else {
              this.subLocationsDropdown = res.jobSubLocations;
              this.jobDetailsupdateForm.patchValue({subLocation: this.subLocationsDropdown?.find(
                (sub: { id: any; }) => sub.id === data?.subLocationId
              ),});
              console.log(this.subLocationsDropdown);
            }
          },
          error: (err: any) => {
            console.error('Error fetching sub-location data:', err);
          },
        });
        this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
          next: (response: any) => {
            if (response.length === 0) {
              this.shiftDropdown = []; // Reset if no shifts are found
            } else {
              this.shiftDropdown = [].concat(...response?.map((element: any) => element.orgShiftsItems)); 
              console.log(this.shiftDropdown);
              console.log(this.shiftDropdown?.find(
                (shift: { id: any }) => shift.id === data?.shiftId
              ));
              
              this.jobDetailsupdateForm.patchValue({
                shiftName: this.shiftDropdown?.find(
                (shift: { id: any }) => shift.id === data?.shiftId
              )
            });

             
              // Flatten the shift data
            }
          },
          error: (err: any) => {
            console.error('Error fetching shift data:', err);
          },
        });
        console.log(this.subLocationsDropdown);
        
       
        
      },
      error: (err: any) => {
        console.error('Error fetching teams:', err);
      }
    });
    // Open the modal
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  //function to open the separation popup
  openModalforSeparationupdate(content: any, data: any): void {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    console.log('separation', data)
    this.postSeparationRequest = data
    this.separationRequestForm.patchValue({
      jobRole: data.jobRole,
      departmentName: data.departmentName,
      team: data.subdepartmentName,
      shiftName: data.shiftName,
      teamManager: `${data?.firstName ?? ''} ${data?.middleName ?? ''} ${data?.lastName ?? ''}`,
      reportingManager: `${data?.fName ?? ''} ${data?.mName ?? ''} ${data?.lName ?? ''}`,
    });
    let currentDate = moment();
    this.postSeparationRequest.appliedDate = currentDate;
    this.onCheckNotiesperiod(this.postSeparationRequest.appliedDate);
  }

  //function to check the noticeperiod valid upto
  onCheckNotiesperiod(Value: any) {
    if (Value) {
      let noticePeriodValidupto = this.noticeperiodDuration;
      let currentDate = moment(this.postSeparationRequest.appliedDate);
      let futureDate = currentDate.add(noticePeriodValidupto, 'days');
      let formatedate = this.formatDate(futureDate);
      this.postSeparationRequest.lastworkingday = formatedate;
    }
  }

  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
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

  //function to get the notice period duration
  getnoticePeriodData() {
    this.subscription = this.http.getData(`ServingPeriods`).subscribe({
      next: (res: any) => {
        let durationValue = res.find((ele: any) => {
          return ele.servingPeriodType?.toLocaleLowerCase() == 'notice period';
        });
        this.noticeperiodDuration = durationValue?.duration;
      },
    });
  }

  //function to post the separation request form
  postSeparationRequestForm() {
    this.isLoading = true;
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
          this.conformationPopup.openSuccessModal('Separation Request Raised Successfully');
          this.getSeparationRequest();
          this.webNotificationformanager();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(err.error.message);
      },
    });
  }

  opendeletModal(content: any, empexperimentdata: any): void {
    // Store the selected job details data for deletion
    this.selectedjobdetailesid = empexperimentdata.id;
    this.empdata = {
      id: empexperimentdata.id,
      employeeId: empexperimentdata.employeeId,
      effectiveDate: empexperimentdata.effectiveDate,
      reportsto: empexperimentdata.reportsto,
      department: empexperimentdata.departmentName,
      bussinessArea: empexperimentdata.bussinessArea || '',
      lopcation: empexperimentdata.lopcation,
      jobRole: empexperimentdata.jobRole,
    };
    // Open the delete confirmation modal
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  updateJobDetails(): void {
    const formData = this.jobDetailsupdateForm.value;
    const sdata = {
      id: this.selectedData?.id,
      employeeId: this.selectedData?.employeeId,
      effectiveDate: formData.effectiveDate ?? this.selectedData?.effectiveDate,
      reportsto: formData.reportingManager.id ?? this.selectedData?.reportsto,
      jobRole: formData.jobRole.designationName ?? this.selectedData?.jobRole,
      subdeptId: formData.team.subdepartmentId ?? this.selectedData.subdeptId,
      status: "Active",
      shiftId: formData.shiftName?.id ?? this.selectedData?.shiftName?.id,
      locationid: formData.location.id ?? this.selectedData?.locationid,
      sublocationid: formData.subLocation.id ?? this.selectedData.sublocationid,
      gradeId: this.selectedData.gradeId,
      teamManagerId: formData.team.reportingmanagerId ?? this.selectedData?.teamManagerId,
      updateddate: this.selectedData.updateddate,
      createddate: this.selectedData.createddate,
      jobTypeId: formData.jobType.sno ?? this.selectedData.jobTypeId,
    };
    // Make the POST request to delete the job details
    this.subscription = this.http.postdata("JobDetails/UPDATER", sdata).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll(); // Close the modal
        this.conformationPopup.openSuccessModal('Job Details updated successfully');
        this.getJobDetails();
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Job Details update failed');
      },
    });
  }

  jobdetailsdelte(): void {
    // Prepare the payload for the delete request
    const sdata = {
      status: "Void",
      id: this.empdata.id,
      employeeId: this.empdata.employeeId,
      effectiveDate: this.empdata.effectiveDate,
      reportsto: this.empdata.reportsto,
      department: this.empdata.department,
      bussinessArea: this.empdata.bussinessArea,
      lopcation: this.empdata.lopcation,
      jobRole: this.empdata.jobRole,
    };
    // Make the POST request to delete the job details
    this.subscription = this.http.postdata("JobDetails/UPDATER", sdata).subscribe({
      next: (data: any) => {
        // Show success modal
        this.conformationPopup.openSuccessModal('Job Details deleted successfully');
        // Refresh the job details list
        this.getJobDetails();
        // Close the modal
        this.modalService.dismissAll();
      },
      error: (err: any) => {
        console.error('Error deleting job details:', err);
        // Show error modal
        this.conformationPopup.openErrorModal('Deletion of data failed');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}