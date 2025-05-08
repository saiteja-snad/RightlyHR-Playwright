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

@Component({
  selector: 'app-team-manger-members',
  imports: [TeamMembersTabsComponent, NoDataFoundComponent, CommonModule, FormsModule, TranslateModule, Select, MultiSelectModule, SearchfilterPipe, ReactiveFormsModule],
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
  departmentDetails = [] as IDepartment[];
  teamDropdownValues: any[] = [];
  teamMemberArray: Iteammembers[] = [];
  requestForm!: FormGroup;
  foremployeeForm!: FormGroup
  teamManagerDropdownValues: any[] = [];
  subdeparmentSingleobj: any;
  joiningDate:any
  constructor(
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    console.log(this.empinfo);
    this.initializeForm()
    this.getAllTeammembersList();
    this.getAllTeammembersLists();
    this.getDepartment()
    this.initializeFormforeachemploye()
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

  getAllTeammembersList() {
    const statuses = ['active', 'trainee active'];
 

  
    this.subscription = this.http.getData(`Employeedata/GetallemployeeswithJobdetails?statuses=${statuses}`).subscribe({
      next: (responseData: any) => {
        console.log(responseData);
        this.teamMemberArray = responseData as Iteammembers[];
        this.teamMemberArray.forEach(member => member.selected = false);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getAllTeammembersLists() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/v1/getEmployeesByhierarchy/${employeeId}`).subscribe({
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

  updateTM() {
    const selectedEmployees = this.requestForm.get('teamEmpselectedOptions')?.value;
    const teammanagers: number[] = Array.isArray(selectedEmployees)
      ? selectedEmployees
      : [];
      console.log(teammanagers)
    const effectiveDate = this.requestForm.get('effectiveDate')?.value;
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teammangerid}&effectiveDate=${effectiveDate}` ;

    this.subscription = this.http.postdata(url, teammanagers).subscribe({
      next: (data: any) => {
        console.log('Success:', data);
        
        this.getAllTeammembersList();
        this.requestForm.reset()
      },
      error: (err: any) => {
        console.error('Error:', err);

      }
    });
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
