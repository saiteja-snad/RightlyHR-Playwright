import { Component } from '@angular/core';
import { TeamMembersTabsComponent } from "../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';
import { Ipersonal, Iteammembers } from '../../../Interfaces/members-model';
import { Subscription } from 'rxjs';
import { IDepartment } from '../../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { SearchfilterPipe } from "../../../Pipes/searchfilter.pipe";
import { Select } from 'primeng/select';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";

@Component({
  selector: 'app-team-manger-members',
  imports: [TeamMembersTabsComponent, NoDataFoundComponent, CommonModule, FormsModule, TranslateModule, Select, MultiSelectModule, SearchfilterPipe, ReactiveFormsModule, DateformatPipe],
  templateUrl: './team-manger-members.component.html',
  styleUrl: './team-manger-members.component.scss'
})
export class TeamMangerMembersComponent {
  empinfo = {} as Ipersonal;
  subscription!: Subscription;
  searchValue: any;
  teammangerid: any
  teamMembersdata: any[] = [];
  spinnerLoader = false
  getTeamMemberArray: any[] = [];
  departmentDetails = [] as IDepartment[];
  teamDropdownValues: any[] = [];
  teamMemberArray: any[] = [];
  requestForm!: FormGroup
  foremployeeForm!: FormGroup
  teamManagerDropdownValues: any[] = [];
  subdeparmentSingleobj: any;
  joiningDate: any
  jobdetailes: any = []
  selectedemployeid: any
  constructor(
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    console.log(this.empinfo);
    this.initializeForm()
    this.getEmployeeId()
    this.initializeFormforeachemploye()
    this.getAllTeammembersList()

    this.getDepartment()
  }

  initializeForm() {
    this.requestForm = this.fb.group({
      effectiveDate: [null, Validators.required],
      teamEmpselectedOptions: [[], Validators.required],
      department: [null, Validators.required],
      teamSelectedOptions: [null, Validators.required],
      teamManagerName: [{ value: null, disabled: true }, Validators.required],

    });
  }

  initializeFormforeachemploye() {
    this.foremployeeForm = this.fb.group({
      effectiveDate: [null, Validators.required],
      teamEmpselectedOptions: [{ value: null, disabled: true }, Validators.required],
      department: [null, Validators.required],
      teamSelectedOptions: [null, Validators.required],
      teamManagerName: [{ value: null, disabled: true }, Validators.required],

    });
  }
  openModals(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {

        this.joiningDate = this.formatDateToLocal(data.dateOfJoining)
      },
      error: (reason: any) => console.error('Error fetching employee data:', reason),
    });
  }

  formatDateToLocal(dateString: string): string {

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //function to get the all the team members
  getAllTeammembersList(): void {
    const loggedInUserId = this.empinfo.employeeId;
  
    this.subscription = this.http.getData(`JobDetails/GetByreporteesEmployeeId?employeeId=${loggedInUserId}`)
      .subscribe({
        next: (responseData: any) => {
          console.log('Response Data:', responseData);
  
          this.teamMemberArray = responseData
            .map((employee: any) => ({
              ...employee,
              jobDetails: employee.jobDetails ?? [], // Default to [] if undefined
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.employeeName ?? ''}`,
              selectedAllGroup: 'Group 1',
            }));
  
          this.getTeamMemberArray = [...this.teamMemberArray];
          console.log('Filtered Team Member Array:', this.teamMemberArray);
        },
        error: (error: any) => {
          console.error('Error fetching team members:', error);
        }
      });
  }
  


  viwejobhistoy(content: any, Value: any) {
    this.modalService.open(content, { size: 'lg', centered: true, scrollable: true });
    console.log(Value);
    this.jobdetailes = Value;
  }
  getDepartment() {
    this.subscription = this.http.getData("Department").subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      },
      error: (err: any) => {
        console.log(err)

      },
    })
  }
  assigintm(content: any, details: any) {
    console.log(details)
    this.selectedemployeid = details.employeeId

    this.foremployeeForm.patchValue({
      teamEmpselectedOptions: `${details.fusionEmpId} - ${details.employeeName ?? ''} `
    })

    this.modalService.open(content, { size: 'lg', centered: true, scrollable: true });
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
      },
      error: (err: any) => {
        this.teamDropdownValues = []; // Reset on error

      }
    });
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
        this.requestForm.patchValue({ teamManagerName: this.teamManagerDropdownValues[0].name ?? '' });

      },
      error: (err: any) => {
        this.teamManagerDropdownValues = []; // Reset on error
        this.requestForm.patchValue({ teamManagerName: null }); // Reset the team manager selection

      },
    });
  }

  onSubDepartmentNameChangeforsingleemploye(selectedSubDepartment: any): void {
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
        this.foremployeeForm.patchValue({ teamManagerName: this.teamManagerDropdownValues[0].name ?? '' });

      },
      error: (err: any) => {
        this.teamManagerDropdownValues = []; // Reset on error
        this.foremployeeForm.patchValue({ teamManagerName: null }); // Reset the team manager selection

      },
    });
  }

  updateTM() {
    const selectedEmployees = this.requestForm.get('teamEmpselectedOptions')?.value;
    const teammanagers: number[] = Array.isArray(selectedEmployees)
      ? selectedEmployees
      : [];
    console.log(teammanagers)
    const effectiveDate = this.requestForm.get('effectiveDate')?.value;
    const departentid=this.requestForm.get('department')?.value?.sno
    const subdepartentid= this.requestForm.get('teamSelectedOptions')?.value?.subdepartmentId;
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teammangerid}&effectiveDate=${effectiveDate}&DeptId=${departentid}&SubdeptId=${subdepartentid}`;

    this.subscription = this.http.postdata(url, teammanagers).subscribe({
      next: (data: any) => {
        this.getAllTeammembersList()
        console.log('Success:', data);
        this.modalService.dismissAll()
        this.http.setBasicDetails();
        this.conformationPopup.openSuccessModal('Team manager updated successfully ')
        this.requestForm.reset()
      },
      error: (err: any) => {
        this.getAllTeammembersList()
        console.error('Error:', err);
        this.conformationPopup.openErrorModal( err.error.Message ||'Team manager updated failed ')
      }
    });
  }


  forsingletmchange() {
    const selectedEmployees = this.selectedemployeid;
    const teammanagers: number[] = Array.isArray(selectedEmployees)
      ? selectedEmployees
      : [selectedEmployees];
    console.log(teammanagers)
    const departentid=this.foremployeeForm.get('department')?.value?.sno
    const subdepartentid= this.foremployeeForm.get('teamSelectedOptions')?.value?.subdepartmentId;
    const effectiveDate = this.foremployeeForm.get('effectiveDate')?.value;
    console.log(departentid)
    console.log(subdepartentid)
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teammangerid}&effectiveDate=${effectiveDate}&DeptId=${departentid}&SubdeptId=${subdepartentid}`;

    this.subscription = this.http.postdata(url, teammanagers).subscribe({
      next: (data: any) => {
        console.log('Success:', data);
        this.modalService.dismissAll()
        this.http.setBasicDetails();
        this.getAllTeammembersList()
        this.conformationPopup.openSuccessModal('Team manager updated successfully ')
        this.foremployeeForm.reset()
      },
      error: (err: any) => {
        this.getAllTeammembersList()
        console.error('Error:', err);
        this.conformationPopup.openErrorModal( err.error.Message ||'Team manager updated failed ')
      }
    });
  }



  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
