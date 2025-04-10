import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IDepartment, IGrade, IJob, IJobdetails, IJobtype, IRole } from '../../../Interfaces/job-model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";

@Component({
  selector: 'app-job-details',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent implements OnInit, OnDestroy{
  separationRequestForm!: FormGroup;
  jobDetailsupdateForm!: FormGroup;
  jobdetails = new BehaviorSubject<any[]>([]);
  teamDropdownValues: any[] = [];
  teamManagerDropdownValues: any[] = [];
  selectedDepartmentId: number = 0;
  jobDetailsForm!: FormGroup;
  subscription!: Subscription;
  empinfo: any;
  departmentDetails= [] as IDepartment[];
  JobroleDetails: any;
  JobtypeDetails = [] as IJobtype[];
  employeinfo: any
  allempdata: any;
  allReportees: any;

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

  selectedEmployeeId: any
  selectedGradeName: string = '';
  getGradename: any
  GradeDetails = [] as IGrade[];
  subDepartmentsDropdownValues: any = [];
  subdeparmentSingleobj: any;
  jobLocationDropDownData: any = [];
  JobroleDesignation = [] as IRole[];
 
  teammangerid: any;
  getGradeid: any;
  selectedjobdetailesid: any;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
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
      effectiveDate: ['', Validators.required],
      jobRole: ['', Validators.required],
      grade: [{ value: null, disabled: true }, Validators.required],
      department: ['', Validators.required],
      team: ['', Validators.required],
      teamManager: [{ value: '', disabled: true }, Validators.required],
      reportingManager: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      shiftName: ['', Validators.required],
      jobType: ['', Validators.required],
    });
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
      error: (reason: any) => console.error('Error fetching employee data:', reason),
    });
  }



  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }


  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data as IDepartment[];
      }
    });
  }

  onDepartmentChange(selectedDepartment: any): void {
    const selectedDepartmentId = selectedDepartment.sno; // Get the sno of the selected department
    console.log('Selected Department ID:', selectedDepartmentId);

    // Fetch the teams based on the selected department ID
    this.subscription = this.http.getData(`Subdepartments/Getnames/${selectedDepartmentId}`).subscribe({
      next: (data: any) => {
        if (data) {
          this.teamDropdownValues = data; // Update the team dropdown values
        } else {
          this.teamDropdownValues = []; // Reset if no teams are found
        }
        this.jobDetailsForm.patchValue({ team: null }); // Reset the team selection
        console.log('Team Dropdown Values:', this.teamDropdownValues);
      },
      error: (err: any) => {
        console.error('Error fetching teams:', err);
        this.teamDropdownValues = []; // Reset on error
        this.jobDetailsForm.patchValue({ team: null }); // Reset the team selection
      }
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

  getReportingTo(): void {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        console.log('Employee Data:', data);
        this.allempdata = data as IJob[];

        // Map the employee data to the format required by p-select
        this.allReportees = this.allempdata.map((employee: { employeeId: number; firstName: string; lastName: string,fusionEmpId:any }) => ({
          id: employee.employeeId, // Use the employeeId as the unique identifier
          employee: ` ${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''} ${employee.lastName ?? ''}`, // Combine first and last name
        }));

        console.log('All Reportees:', this.allReportees);
      },
      error: (err: any) => {
        console.error('Error fetching employee data:', err);
        this.allReportees = []; // Reset on error
      },
    });
  }

  // Method to handle selection of a reporting manager
  onReportingManagerChange(selectedManager: any): void {
    this.selectedEmployeeId = selectedManager?.id; // Store the selected employee ID
    console.log('Selected Employee ID:', this.selectedEmployeeId);
  }
  onSubDepartmentNameChange(selectedSubDepartment: any): void {
    const selectedSubDepartmentId = selectedSubDepartment.subdepartmentId; // Get the subdepartmentId of the selected team
    console.log('Selected SubDepartment ID:', selectedSubDepartmentId);

    // Fetch the team manager data based on the selected subdepartmentId
    this.subscription = this.http.getData(`Subdepartments/${selectedSubDepartmentId}`).subscribe({
      next: (data: any) => {
        this.subdeparmentSingleobj = data;

        console.log('SubDepartment Data:', this.subdeparmentSingleobj);

        // Update the team manager dropdown values
        this.teamManagerDropdownValues = this.subdeparmentSingleobj.map((manager: any) => ({
          id: manager.reportingmanagerId,
          name: manager.middleName
            ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
            : `${manager.firstName} ${manager.lastName}`,
        }));

        console.log('Team Manager Dropdown Values:', this.teamManagerDropdownValues);
        this.teammangerid = this.teamManagerDropdownValues[0].id; // Set the default team manager ID
        // Reset the team manager selection
        this.jobDetailsForm.patchValue({ teamManager: this.teamManagerDropdownValues[0].name });
      },
      error: (err: any) => {
        console.error('Error fetching team manager data:', err);
        this.teamManagerDropdownValues = []; // Reset on error
        this.jobDetailsForm.patchValue({ teamManager: null }); // Reset the team manager selection
      },
    });
  }

  onDepartmentNameChange() {
    console.log(this.selectedDepartmentId);
    this.subscription = this.http
      .getData(`Subdepartments/Getnames/${this.selectedDepartmentId}`)
      .subscribe({
        next: (data: any) => {
          this.subDepartmentsDropdownValues = data;
          console.log(this.subDepartmentsDropdownValues);
        },
        complete: () => { },
      });

  }

  getJobDesignation() {
    this.subscription = this.http
      .getData('DesignationGradeMapper?sort=designationName')
      .subscribe({
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
        console.log('Grade Data:', data);
        this.selectedGradeName = data.gradeName; 
    
        // Patch the grade name into the form
        this.jobDetailsForm.patchValue({ grade: this.selectedGradeName });
      },
      error: (err: any) => {
        console.error('Error fetching grade name:', err);
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
        console.log(data);
        this.jobLocationDropDownData = data
      }
    })
  }

  subLocationsDropdown: any = [] // To store the dynamically fetched sub-locations

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
        next: (data: any) => {
          console.log('Sub Location Data:', data);

          if (data.length === 0) {
            this.subLocationsDropdown = []; // Reset if no sub-locations are found
          } else {
            this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
          }

          // Reset the sub-location selection in the form
          this.jobDetailsForm.patchValue({ subLocation: null });
        },
        error: (err: any) => {
          console.error('Error fetching sub-location data:', err);
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
      const locationId = this.jobDetailsForm.get('location')?.value?.id ??  this.jobDetailsForm.get('location')?.value; // Get the selected location ID
      const subLocationId = selectedSubLocation.id; // Get the selected sub-location ID

      console.log('Location ID:', locationId);
      console.log('Sub Location ID:', subLocationId);

      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
        next: (data: any) => {
          console.log('Shift Data:', data);

          if (data.length === 0) {
            this.shiftDropdown = []; // Reset if no shifts are found

          } else {
            this.shiftDropdown = [].concat(...data.map((element: any) => element.orgShiftsItems)); // Flatten the shift data
          }

          console.log('Shift Dropdown Values:', this.shiftDropdown);
        },
        error: (err: any) => {
          console.error('Error fetching shift data:', err);
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

      console.log('Job Details to Submit:', playload);

      this.subscription = this.http.postdata('JobDetails', playload).subscribe({
        next: (data: any) => {
          console.log('Response:', data);
        
          this.jobDetailsForm.reset();
          this.modalService.dismissAll(); 
          this.conformationPopup.openSuccessModal('Job Details added successfully');
          this.getJobDetails(); // Refresh job details

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
          this.jobdetails.next(data)
          console.log(this.jobdetails);
        },
      });
  }
  
  selectedJobRoleObj :any; // To store the selected job role object
  teamManagerName: string = ''; // To store the team manager name
  shiftDropdowns: any = []; // To store the dynamically fetched shifts
  selectedData = {} as any; // To store the selected job details data for updating
  openModalupdate(content: any, data: any): void {
    const locationId = data.locationId; // Get the location ID from the selected job details
    const subLocationId = data.subLocationId; // Get the sub-location ID from the selected job details
    this.selectedjobdetailesid = data.id; 
    this.selectedData = data; // Store the selected job details data for updating
    console.log('Selected Job Details ID:', data);
    this.teamManagerName = data?.firstName + ' ' + data?.middleName + ' ' + data?.lastName
    const effectiveDate = data.effectiveDate
      ? new Date(data.effectiveDate).toISOString().split('T')[0]
      : null;
      this.selectedJobRoleObj = this.JobroleDesignation.find(
        role => role.designationName === data.jobRole
      ); 
      this.subscription = this.http.getData(`Subdepartments/Getnames/${data.departmentId}`).subscribe({
        next: (teamData: any) => {
          this.teamDropdownValues = teamData || [];
          console.log('Team Dropdown Values:', this.teamDropdownValues);
          this.teamManagerDropdownValues = this.teamDropdownValues.map((manager: any) => ({
            id: manager.reportingmanagerId,
            teamManager: manager.middleName
              ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
              : `${manager.firstName} ${manager.lastName}`,
          }));
          this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${locationId}`).subscribe({
            next: (data: any) => {
              console.log('Sub Location Data:', data);
    
              if (data.length === 0) {
                this.subLocationsDropdown = []; // Reset if no sub-locations are found
              } else {
                this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
              }
    
             
            },
            error: (err: any) => {
              console.error('Error fetching sub-location data:', err);
             
            },
          });
          this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
            next: (data: any) => {
              console.log('Shift Data:', data);
    
              if (data.length === 0) {
                this.shiftDropdowns = []; // Reset if no shifts are found
    
              } else {
                this.shiftDropdowns = [].concat(...data.map((element: any) => element.orgShiftsItems)); // Flatten the shift data
              }
    
              console.log('Shift Dropdown Values:', this.shiftDropdowns);
            },
            error: (err: any) => {
              console.error('Error fetching shift data:', err);
             
    
            },
          });
          
          this.jobDetailsupdateForm.patchValue({
            effectiveDate: effectiveDate,
            jobRole: this.selectedJobRoleObj,
            location : this.jobLocationDropDownData.find(
              (location: { jobLocationName: any; }) => location.jobLocationName === data.locationName
            ),
            department: this.departmentDetails.find(
              dept => dept.departmentName === data.departmentName
            ),
            team: this.teamDropdownValues.find(
              team => team.subdepartmentName === data?.subdepartmentName
            ),
            subLocation: this.subLocationsDropdown.find(
              (sub: { jobSubLocationName: any; }) => sub.jobSubLocationName === data.subLocation
            ),
            shiftName: this.shiftDropdowns.find(
              (shift: { shiftName: any; }) => shift.shiftName === data.shiftName
            ),
            teamManager : this.teamManagerName,
            jobType: this.JobtypeDetails.find(
              jt => jt.jobType1 === data.jobTypeName
            ),
            reportingManager : this.allReportees.find(
              (report: { id: any; employee : any }) => report.id === data.reportingmanagerId
            ),
            grade: this.selectedJobRoleObj?.gradeName,
            
            
          });
    
        
          console.log('Form Value After Patching:', this.jobDetailsupdateForm.value);
          //this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
        },
        error: (err: any) => {
          console.error('Error fetching teams:', err);
          
        }
      });
      
  

    console.log('Form Value After Patching:', this.jobDetailsupdateForm.value);
  
    // Open the modal
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
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
      id: this.selectedData.id,
      employeeId: this.selectedData.employeeId,
      effectiveDate: formData.effectiveDate ?? this.selectedData.effectiveDate,
      reportsto:formData.reportingManager.id ?? this.selectedData.reportsto,
      jobRole: formData.jobRole.designationName ?? this.selectedData.jobRole,
      subdeptId :formData.team.subdepartmentId ?? this.selectedData.subdeptId,
      status: "Active",
      shiftId : formData.shiftName.id ?? this.selectedData.shiftId,
      locationid :formData.location.id ?? this.selectedData.locationid,
      sublocationid : formData.subLocation.id ?? this.selectedData.sublocationid,
      gradeId : this.selectedData.gradeId,
      teamManagerId :formData.team.reportingmanagerId ?? this.selectedData.teamManagerId,
      updateddate : this.selectedData.updateddate,
      createddate : this.selectedData.createddate,
      jobTypeId :formData.jobType.sno ?? this.selectedData.jobTypeId,
    };
  
    // Make the POST request to delete the job details
    this.subscription = this.http.postdata("JobDetails/UPDATER", sdata).subscribe({
      next: (data: any) => {
        console.log('Update Response:', data);
        this.conformationPopup.openSuccessModal('Job Details updated successfully');
        this.getJobDetails();
      },
      error: (err: any) => {
        console.error('Error deleting job details:', err);
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
        console.log('Delete Response:', data);
  
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
