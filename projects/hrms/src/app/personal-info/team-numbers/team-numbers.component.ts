import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchfilterPipe } from "../../Pipes/searchfilter.pipe";
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { Ipersonal, Iteammembers } from '../../Interfaces/members-model';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-team-numbers',
  imports: [
    CommonModule,
    Select,
    FormsModule,
    PaginatorModule,
    TranslateModule,
    DropdownModule,
    SearchfilterPipe,
    ReactiveFormsModule,
    NoDataFoundComponent,
  ],
  templateUrl: './team-numbers.component.html',
  styleUrl: './team-numbers.component.scss',
})
export class TeamNumbersComponent implements OnInit, OnDestroy {
  rmForm!: FormGroup;
  managers: any[] = [];
  subscription!: Subscription;
  TeamMemberArray: Iteammembers[] = [];
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  pouptext1: any;
  selectedEmployees: Iteammembers[] = [];
  selectedEmployeeIds: string[] = [];
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  empinfo = {} as Ipersonal;
  searchValue: any;
  spinnerLoader = false;
  selectedData: any = {}; // Initialize properly
  employees: any[] = [];
  employeeIds: number[] = [];
  selectedReportingManager: any = {};
  isDropdownOpen: boolean = false;
  reportingManager: any;
  fusionEmpId: any;
  disablebuttonforemployeeid: boolean = true;
  searchText = '';

  constructor(
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    public rbac: RbacService
  ) {}

  onRowsChange() {
    this.first = 0;
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    console.log(this.empinfo);
    this.getAllTeammembersList();
    this.getEmployee();
    this.formsubmit();
  }

  formsubmit() {
    this.rmForm = this.fb.group({
      mReportingto: [null, Validators.required],
    });
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onclick(details: any) {
    console.log('Original Details:', details); // Check if details contain data

    if (!details || Object.keys(details).length === 0) {
      console.error('Error: No details received.');
      return;
    }

    this.selectedData = JSON.parse(JSON.stringify(details));
    this.selectedData.jobId = details.jobId;
    this.selectedData.reportingToEmployeeId = details.reportingToEmployeeId;
  }

  selectedManager: any = null; // Store selected manager object

  onSelectManager(event: any) {
    this.selectedManager = event.value; // Capture selected object
    if (!this.selectedManager) {
      console.error('Error: No manager selected.');
      alert('Please select a reporting manager.');
      return;
    }

    this.selectedData.employeeId = this.selectedManager.employeeId ?? '';
    this.selectedData.id = this.selectedManager.jobId ?? ''; // Ensure jobId is correctly assigned
  }

  searchEmployeeSinglerecord(employee: any, searchTerms: string[]): boolean {
    return searchTerms.every(
      (term) =>
        employee.fusionEmpId.toLowerCase().includes(term) ||
        employee.firstName.toLowerCase().includes(term) ||
        (employee.middleName &&
          employee.middleName.toLowerCase().includes(term)) ||
        employee.lastName.toLowerCase().includes(term)
    );
  }

  toggleDropdown(dropcategory: string) {
    if (dropcategory == 'reporting') {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  onSearchTextChange(value: string) {
    if (!value.trim()) {
      this.selectedReportingManager = {};
      this.reportingManager = '';
      this.disablebuttonforemployeeid = false;
    }
  }

  onClickValidation(employee: any) {
    this.selectedReportingManager = employee;
    this.reportingManager = this.selectedReportingManager.fusionEmpId;
    if (this.selectedReportingManager.employeeId) {
      this.fusionEmpId = this.selectedReportingManager.employeeId;
      this.disablebuttonforemployeeid = true;
      this.isDropdownOpen = false; // Close the dropdown after selection
      // Update searchText with selected employee's details
      let employeeName = this.selectedReportingManager.firstName
        ? this.selectedReportingManager.firstName
        : '';
      employeeName += this.selectedReportingManager.middleName
        ? ' ' + this.selectedReportingManager.middleName
        : '';
      employeeName += this.selectedReportingManager.lastName
        ? ' ' + this.selectedReportingManager.lastName
        : '';
      this.searchText = `${
        this.selectedReportingManager.fusionEmpId
      }-${employeeName.trim()}`;
      // Store employeeId in selectedData
      this.selectedData.employeeId = this.selectedReportingManager.employeeId;
      console.log(this.selectedReportingManager.employeeId);
    } else {
      this.disablebuttonforemployeeid = false;
    }
  }

  filterEmployees(): any[] {
    return this.employees
      .filter((emp) => emp && emp.fusionEmpId)
      .map((emp) => ({
        ...emp,
        name: `${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${
          emp.lastName
        }`,
      }));
  }

  updateRM() {
    this.spinnerLoader = true;
    let jobid = this.selectedData.id;
    let ManagerEmployeeId = this.selectedData.employeeId;
    this.subscription = this.http
      .postdata(
        `Employeedata/TeammemberUpdate?jobid=${jobid}&ManagerEmployeeId=${ManagerEmployeeId}`,
        this.selectedData
      )
      .subscribe({
        next: (data: any) => {
          console.log('Next callback');
          this.conformationPopup.openSuccessModal('Updated Successfully');
          console.log(data);
        },
        error: (reason: any) => {
          console.log('Error callback');
          console.log(reason);
          this.conformationPopup.openErrorModal('Updated Successfully');
          this.spinnerLoader = false;
        },
      });
  }

  getAllTeammembersList() {
    let EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe(
        (responseData: any) => {
          console.log(responseData);
          this.TeamMemberArray = responseData as Iteammembers[];
          this.TeamMemberArray.forEach((member) => (member.selected = false));
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getEmployee() {
    this.subscription = this.http
      .getData('JobDetails/getAllReportingManagers')
      .subscribe({
        next: (data: any) => {
          this.managers = data
            .filter((emp: { fusionEmpId: any }) => emp.fusionEmpId)
            .map(
              (emp: {
                firstName: any;
                middleName?: string;
                lastName: any;
              }) => ({
                ...emp,
                name: `${emp.firstName} ${
                  emp.middleName ? emp.middleName + ' ' : ''
                }${emp.lastName}`,
              })
            );
        },
        error: (err) => console.log(err),
      });
  }

  updateTeamRM() {
    let ManagerId = this.selectedEmployeeIds[0];
    let requestBody = this.selectedEmployees.map((employee) => {
      return {
        jobRole: employee.jobRole,
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName,
        workEmail: employee.workEmail,
        fusionEmpId: employee.fusionEmpId,
        employeeId: employee.employeeId,
        contactnumber: employee.contactnumber,
        id: employee.id,
      };
    });
  }

  resetAndClose(modal: any): void {
    this.rmForm.reset(); // clear the form
    modal.dismiss(); // close the popup
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}


