import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ipersonal, Iteammembers } from '../../../Interfaces/members-model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IDepartment } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Router } from '@angular/router';
import { SearchfilterPipe } from '../../../pipes/searchfilter.pipe';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TeamMembersTabsComponent } from "../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { MyInfoTeamNumbersTabComponent } from "../../../shared/myinfo-tabs/my-info-team-numbers-tab/my-info-team-numbers-tab.component";
@Component({
  selector: 'app-team-members',
  imports: [NoDataFoundComponent, CommonModule, FormsModule, TranslateModule, Select, MultiSelectModule, 
    ReactiveFormsModule, TableModule, DataLoaderContentComponent, TeamMembersTabsComponent,
    MyInfoTeamNumbersTabComponent],
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.scss',
})

export class TeamMembersComponent implements OnInit, OnDestroy {
  @ViewChild('teamMembersTable') teamMembersTable!: Table;
  emp: any;
  empinfo = {} as Ipersonal;
  subscription!: Subscription;
  searchValue: any;
  teammangerid: any;
  selectedEmployees: Iteammembers[] = [];
  selectedEmployeeIds: string[] = [];
  managers: any[] = [];
  rmForm!: FormGroup;
  teamForm!: FormGroup;
  selectedData: any = {};
  teamMembersdata: any[] = [];
  spinnerLoader = false;

  departmentDetails = [] as IDepartment[];
  teamDropdownValues: any[] = [];
  teamMemberArray: any[] = [];
  getTeamMemberArray: any[] = [];
  originalTeamMemberArray: any[] = []; // Store original unsorted data
  requestForm!: FormGroup;
  foremployeeForm!: FormGroup;
  teamManagerDropdownValues: any[] = [];
  subdeparmentSingleobj: any;
  joiningDate: any;
  jobdetailes: any = [];
  selectedemployeid: any;
  loading = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, private accessNav: AccessNavigationService, private modalService: NgbModal, 
    private fb: FormBuilder, private conformationPopup: OpenModalService, public rbac: RbacService, 
    public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.initializeFormforeachemploye();
    this.getDepartment();
    this.formsubmit();
    this.formsubmits();
    this.getEmployee();
    this.requestForm.get('department')?.valueChanges.subscribe((department) => {
      const teamControl = this.requestForm.get('teamSelectedOptions');
      if (!department) {
        teamControl?.disable();
        teamControl?.reset(); // Optionally clear selected team
      } else {
        teamControl?.enable();
      }
    });
    this.foremployeeForm.get('department')?.valueChanges.subscribe((department) => {
      const teamControl = this.foremployeeForm.get('teamSelectedOptions');
      if (!department) {
        teamControl?.disable();
        teamControl?.reset();
        this.teamManagerDropdownValues = []
      } else {
        teamControl?.enable();
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  clearData() {
    this.modalService.dismissAll();
    this.requestForm.reset();
    this.teamForm.reset();
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.getEmployeeId();
      this.getAllTeammembersList();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.getEmployeeId();
      this.getAllTeammembersList();
    }
  }

  formsubmit() {
    this.rmForm = this.fb.group({
      mReportingto: [null, Validators.required],
    });
  }

  formsubmits() {
    this.teamForm = this.fb.group({
      teamMembers: [null, Validators.required],
      reportingManager: [null, Validators.required],
    });
  }

  initializeForm() {
    this.requestForm = this.fb.group({
      effectiveDate: [null, Validators.required],
      teamEmpselectedOptions: [[], Validators.required],
      department: [null, Validators.required],
      // teamSelectedOptions: [null, Validators.required],
      teamSelectedOptions: [
        { value: null, disabled: true },
        Validators.required,
      ],
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
    this.clearData();
    this.modalService.open(content, {centered: true, backdrop: 'static', size: 'lg'});
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.joiningDate = this.formatDateToLocal(data.dateOfJoining);
      },
      error: (reason: any) =>
        console.error('Error fetching employee data:', reason),
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
    this.loading = true;
    const EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe(
      (responseData: any) => {
        this.loading = false;
        this.teamMemberArray = responseData.map((emp: any) => {
          const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
          const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
          return {
            ...emp,
            jobDetails: emp.jobDetails ?? [], // Default to [] if undefined
            fullName,
            selectedAllGroup: 'Group 1'
          };
        });
        //  Alphabetical sorting by firstName
        this.teamMemberArray.sort((a: any, b: any) =>
          a.firstName.localeCompare(b.firstName, 'en', { sensitivity: 'base' })
        );
        this.originalTeamMemberArray = [...this.teamMemberArray];
        this.getTeamMemberArray = [...this.teamMemberArray];
      },
      (error) => {
        console.error(error);
        this.loading = false;
      }
    );
  }

  select(act: any) {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/myinfo')) {
      this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
      this.goToAccessibleRoute('/personalinfo');
    }
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  assigintm(content: any, details: any) {
    this.foremployeeForm.reset();
    this.selectedemployeid = details.employeeId;
    const fullName = [details.firstName, details.middleName, details.lastName].filter(Boolean).join(' ');
    this.foremployeeForm.patchValue({
      teamEmpselectedOptions: `${details.fusionEmpId} - ${fullName}`,
    });
    this.modalService.open(content, { size: 'lg', centered: true, scrollable: true });
  }

  // onDepartmentChange(selectedDepartment: any): void {
  //   const selectedDepartmentId = selectedDepartment.sno; // Get the sno of the selected department
  //   // Fetch the teams based on the selected department ID
  //   this.subscription = this.http.getData(`Subdepartments/Getnames/${selectedDepartmentId}`).subscribe({
  //     next: (data: any) => {
  //       if (data) {
  //         this.teamDropdownValues = data; // Update the team dropdown values
  //       } else {
  //         this.teamDropdownValues = []; // Reset if no teams are found
  //       }
  //     },
  //     error: (err: any) => {
  //       this.teamDropdownValues = []; // Reset on error
  //     }
  //   });
  // }

  // onSubDepartmentNameChange(selectedSubDepartment: any): void {
  //   const selectedSubDepartmentId = selectedSubDepartment.subdepartmentId;
  //   this.subscription = this.http.getData(`Subdepartments/${selectedSubDepartmentId}`).subscribe({
  //     next: (data: any) => {
  //       this.subdeparmentSingleobj = data;
  //       // Update the team manager dropdown values
  //       this.teamManagerDropdownValues = this.subdeparmentSingleobj.map((manager: any) => ({
  //         id: manager.reportingmanagerId,
  //         name: manager.middleName ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
  //           : `${manager.firstName} ${manager.lastName}` || '',
  //       }));
  //       this.teammangerid = this.teamManagerDropdownValues[0].id; // Set the default team manager ID
  //       // Reset the team manager selection
  //       this.requestForm.patchValue({ teamManagerName: this.teamManagerDropdownValues[0].name ?? '' });
  //     },
  //     error: (err: any) => {
  //       this.teamManagerDropdownValues = []; // Reset on error
  //       this.requestForm.patchValue({ teamManagerName: null }); // Reset the team manager selection
  //     },
  //   });
  // }

  onDepartmentChange(selectedDepartment: any): void {
    const selectedDepartmentId = selectedDepartment?.sno;
    // Reset team and manager
    this.requestForm.patchValue({
      teamSelectedOptions: null,
      teamManagerName: null,
    });
    this.foremployeeForm.patchValue({
      teamSelectedOptions: null,
      teamManagerName: null,
    });
    this.teamDropdownValues = [];
    this.teamManagerDropdownValues = [];
    if (!selectedDepartmentId) return;
    this.subscription = this.http.getData(`Subdepartments/Getnames/${selectedDepartmentId}`).subscribe({
      next: (data: any) => {
        this.teamDropdownValues = data || [];
      },
      error: () => {
        this.teamDropdownValues = [];
      },
    });
  }

  onSubDepartmentNameChange(selectedSubDepartment: any): void {
    // If no subdepartment selected, reset and return
    if (!selectedSubDepartment || !selectedSubDepartment.subdepartmentId) {
      this.requestForm.patchValue({ teamManagerName: '' });
      this.teamManagerDropdownValues = [];
      return;
    }
    const selectedSubDepartmentId = selectedSubDepartment.subdepartmentId;
    // Clear team manager initially
    this.requestForm.patchValue({ teamManagerName: '' });
    this.teamManagerDropdownValues = [];
    this.subscription = this.http.getData(`Subdepartments/${selectedSubDepartmentId}`).subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.teamManagerDropdownValues = data.map((manager: any) => ({
            id: manager.reportingmanagerId,
            name: manager.middleName
              ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
              : `${manager.firstName} ${manager.lastName}`,
          }));
          // Set the first manager as default
          const defaultManager = this.teamManagerDropdownValues[0];
          this.teammangerid = defaultManager.id;
          this.requestForm.patchValue({
            teamManagerName: defaultManager.name,
          });
        } else {
          // No managers returned
          this.requestForm.patchValue({ teamManagerName: '' });
        }
      },
      error: () => {
        // On error, reset team manager
        this.teamManagerDropdownValues = [];
        this.requestForm.patchValue({ teamManagerName: '' });
      },
    });
  }

  onSubDepartmentNameChangeforsingleemploye(selectedSubDepartment: any): void {
    const selectedSubDepartmentId = selectedSubDepartment.subdepartmentId;
    this.subscription = this.http.getData(`Subdepartments/${selectedSubDepartmentId}`).subscribe({
      next: (data: any) => {
        this.subdeparmentSingleobj = data;
        // Update the team manager dropdown values
        this.teamManagerDropdownValues = this.subdeparmentSingleobj.map(
          (manager: any) => ({
            id: manager.reportingmanagerId,
            name: manager.middleName
              ? `${manager.firstName} ${manager.middleName} ${manager.lastName}`
              : `${manager.firstName} ${manager.lastName}` || '',
          })
        );
        this.teammangerid = this.teamManagerDropdownValues[0].id; // Set the default team manager ID
        // Reset the team manager selection
        this.foremployeeForm.patchValue({
          teamManagerName: this.teamManagerDropdownValues[0].name ?? '',
        });
      },
      error: (err: any) => {
        this.teamManagerDropdownValues = []; // Reset on error
        this.foremployeeForm.patchValue({ teamManagerName: null }); // Reset the team manager selection
      },
    });
  }

  updateTM() {
    const selectedEmployees = this.requestForm.get('teamEmpselectedOptions')?.value;
    const teammanagers: number[] = Array.isArray(selectedEmployees) ? selectedEmployees : [];
    const effectiveDate = this.requestForm.get('effectiveDate')?.value;
    const departentid = this.requestForm.get('department')?.value?.sno;
    const subdepartentid = this.requestForm.get('teamSelectedOptions')?.value ?.subdepartmentId;
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teammangerid}&effectiveDate=${effectiveDate}&DeptId=${departentid}&SubdeptId=${subdepartentid}`;
    this.subscription = this.http.postdata(url, teammanagers).subscribe({
      next: (data: any) => {
        this.getAllTeammembersList();
        this.modalService.dismissAll();
        this.http.setBasicDetails();
        this.conformationPopup.openSuccessModal('Team manager updated successfully ');
        this.requestForm.reset();
      },
      error: (err: any) => {
        this.getAllTeammembersList();
        console.error('Error:', err);
        this.conformationPopup.openErrorModal(
          err.error.Message || 'Team manager updated failed '
        );
      },
    });
  }

  forsingletmchange() {
    const selectedEmployees = this.selectedemployeid;
    const teammanagers: number[] = Array.isArray(selectedEmployees) ? selectedEmployees : [selectedEmployees];
    const departentid = this.foremployeeForm.get('department')?.value?.sno;
    const subdepartentid = this.foremployeeForm.get('teamSelectedOptions') ?.value?.subdepartmentId;
    const effectiveDate = this.foremployeeForm.get('effectiveDate')?.value;
    const url = `JobDetails/TeamManagerUpdate?teamManagerEmployeeId=${this.teammangerid}&effectiveDate=${effectiveDate}&DeptId=${departentid}&SubdeptId=${subdepartentid}`;
    this.subscription = this.http.postdata(url, teammanagers).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.http.setBasicDetails();
        this.getAllTeammembersList();
        this.conformationPopup.openSuccessModal('Team manager updated successfully ');
        this.foremployeeForm.reset();
      },
      error: (err: any) => {
        this.getAllTeammembersList();
        console.error('Error:', err);
        this.conformationPopup.openErrorModal(
          err.error.Message || 'Team manager updated failed '
        );
      },
    });
  }

  selectedEmployeeDetails = {} as any;
  openModal(content: any, details: any) {
    this.selectedEmployeeDetails = details;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  getEmployee() {
    this.subscription = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : [];
        this.managers = list
          .map((emp: any) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const name = `${fusionPart}${emp.firstName?.trim() ?? ''} ${emp.middleName ? emp.middleName.trim() + ' ' : ''}${emp.lastName?.trim() ?? ''}`.trim();
            return { ...emp, name };
          })
          .sort((a: any, b: any) => {
            const nameA = a.firstName?.trim().toLowerCase() || '';
            const nameB = b.firstName?.trim().toLowerCase() || '';
            return nameA.localeCompare(nameB);
          });
      },
      error: (err) => console.error('Error fetching employees:', err),
    });
  }


  selectedManager: any = null;
  onSelectManager(event: any) {
    this.selectedManager = event.value;
    if (!this.selectedManager) {
      console.error('Error: No manager selected.');
      return;
    }
    this.selectedData.employeeId = this.selectedManager.employeeId ?? '';
    this.selectedData.id = this.selectedManager.jobId ?? ''; // Ensure jobId is correctly assigned
  }

  updateRM() {
    this.spinnerLoader = true;
    let jobid = this.selectedEmployeeDetails.id;
    let ManagerEmployeeId = this.rmForm.get('mReportingto')?.value?.employeeId;
    this.subscription = this.http.postdata(`Employeedata/TeammemberUpdate?jobid=${jobid}&ManagerEmployeeId=${ManagerEmployeeId}`, this.selectedData).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Reporting manager updated successfully');
        this.getAllTeammembersList();
        this.http.setBasicDetails();
      },
      error: (reason: any) => {
        if (reason) {
          this.http.setBasicDetails();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Reporting manager updated successfully');
          this.getAllTeammembersList();
          this.spinnerLoader = false;
          this.rmForm.reset();
        }
      },
    });
  }

  onSelectManagers(event: any, field: string) {
    if (field === 'teamMembers') {
      this.selectedEmployees = Array.isArray(event.value) ? event.value : [event.value];
      this.selectedEmployeeIds = this.selectedEmployees.map(
        (emp) => emp.employeeId
      );
    }
    if (field === 'reportingManager') {
      this.teamForm.patchValue({ reportingManager: event.value });
    }
  }

  updateTeamRMs() {
    this.spinnerLoader = true;
    if (!Array.isArray(this.selectedEmployees) || this.selectedEmployees.length === 0) {
      console.error('selectedEmployees is not a valid array', this.selectedEmployees);
      return;
    }
    let requestBody = this.selectedEmployees.map((employee) => ({
      jobRole: employee.jobRole,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName ?? '',
      workEmail: employee.workEmail,
      fusionEmpId: employee.fusionEmpId,
      employeeId: employee.employeeId,
      contactnumber: employee.contactnumber,
      id: employee.id,
    }));
    const ManagerId = this.teamForm.value.reportingManager?.employeeId;
    if (!ManagerId) {
      console.error('No valid ManagerId found.');
      return;
    }
    this.subscription = this.http.postdata(`JobDetails/joblist/updater?ManagerId=${ManagerId}`, requestBody).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Reporting manager updated successfully');
        this.getAllTeammembersList();
        this.http.setBasicDetails();
      },
      error: (reason: any) => {
        if (reason) {
          this.modalService.dismissAll();
          this.http.setBasicDetails();
          this.conformationPopup.openSuccessModal('Reporting manager updated successfully');
          this.spinnerLoader = false;
          this.teamForm.reset();
          this.getAllTeammembersList();
          //this.getAllTeammembersLists();
        }
      },
    });
  }

  getFilteredAndSortedMembers(): any[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.getTeamMemberArray;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.getTeamMemberArray.filter((member: any) => {
      const fusionEmpId = member.fusionEmpId?.toLowerCase() || '';
      const employeeName = `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`.toLowerCase().trim();
      const workEmail = member.workEmail?.toLowerCase() || '';
      const contactNumber = member.contactnumber?.toString() || '';
      
      return fusionEmpId.includes(searchTerm) ||
             employeeName.includes(searchTerm) ||
             workEmail.includes(searchTerm) ||
             contactNumber.includes(searchTerm);
    });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.getTeamMemberArray = [...this.originalTeamMemberArray];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.teamMembersTable) {
          this.teamMembersTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      if (field === 'employeeName') {
        // Handle employee name sorting (combine first, middle, last name)
        val1 = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''}`.trim();
        val2 = `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim();
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle Employee ID sorting (alphanumeric)
      if (field === 'fusionEmpId') {
        return event.order * String(val1 ?? '').localeCompare(
          String(val2 ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      // Handle contact number sorting (numeric)
      if (field === 'contactnumber') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}