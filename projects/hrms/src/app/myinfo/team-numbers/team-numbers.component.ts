import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ipersonal, Iteammembers } from '../../Interface/members-model';
//import { Iteammembers } from '../../models/teammembers';


@Component({
  selector: 'app-team-numbers',
  imports: [CommonModule,Select,FormsModule, PaginatorModule, DropdownModule],
  templateUrl: './team-numbers.component.html',
  styleUrl: './team-numbers.component.scss'
})
export class TeamNumbersComponent {
  subscription!: Subscription;
  TeamMemberArray: Iteammembers[] = [];
  // rmData=[
  //   {name:'Rajesh',designation:'Software Engineer',team:'Development',location:'Bangalore'}]
    totalRecords = 100
    first: any = 0;
    rows: any = 10;
  
    options = [
      { label: 10, value: 10 },
      { label: 15, value: 15 },
      { label: 20, value: 20 },
      { label: 25, value: 25 }
    ];
    empinfo = {} as Ipersonal;
  
  constructor(
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal) { }
  onRowsChange() {
    this.first = 0;

  }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
     this.getAllTeammembersList();
     this.getEmployee();
   }
 
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }
  
  employees: any[] = [];
  employeeIds: number[] = [];
  openModal(content: any) {
    this.modalService.open(content, { centered: true,backdrop: 'static' });
  }
  selectedData = {} as any
  onclick(details: any) {

    console.log(details);
    this.selectedData = JSON.parse(JSON.stringify(details))
    this.selectedData.employeeId = "";
    this.selectedData.id
    console.log(this.selectedData.id)
  }
  selectedReportingManager: any = {};
  isDropdownOpen: boolean = false;
  reportingManager: any;
  fusionEmpId: any;
  disablebuttonforemployeeid: boolean = true;
  searchText = '';
  searchEmployeeSinglerecord(employee: any, searchTerms: string[]): boolean {
    return searchTerms.every((term) =>
        employee.fusionEmpId.toLowerCase().includes(term) ||
        employee.firstName.toLowerCase().includes(term) ||
        (employee.middleName && employee.middleName.toLowerCase().includes(term)) ||
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
        let employeeName = this.selectedReportingManager.firstName ? this.selectedReportingManager.firstName : '';
        employeeName += this.selectedReportingManager.middleName ? ' ' + this.selectedReportingManager.middleName : '';
        employeeName += this.selectedReportingManager.lastName ? ' ' + this.selectedReportingManager.lastName : '';
        this.searchText = `${this.selectedReportingManager.fusionEmpId}-${employeeName.trim()}`;
        // Store employeeId in selectedData
        this.selectedData.employeeId = this.selectedReportingManager.employeeId;
        console.log(this.selectedReportingManager.employeeId)
    } else {
        this.disablebuttonforemployeeid = false;
    }
  }
  filterEmployees(): any[] {
    const searchTerms = this.searchText.toLowerCase().split(' ');
  
    return this.employees.filter((item) =>
        this.searchEmployeeSinglerecord(item, searchTerms)
    );
  }
  updateRM() {
    let jobid = this.selectedData.id;
    let ManagerEmployeeId = this.selectedData.employeeId;

    this.subscription = this.http.postdata(`Employeedata/TeammemberUpdate?jobid=${jobid}&ManagerEmployeeId=${ManagerEmployeeId}`, this.selectedData).subscribe({
      next: (data: any) => {
        console.log('Next callback');
        console.log(data);

      },
      error: (reason: any) => {
        console.log('Error callback');
        console.log(reason);
       
        if (reason) {

          this.pouptext1 = 'Reporting Manager updated successfully';
          const modalElement = document.getElementById('successhide');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
          }
          // f.resetForm();
          setTimeout(function () {
            location.reload();
          }, 1500);
        }

      }
    });
  }
  getAllTeammembersList() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe(
      (responseData: any) => {
        console.log(responseData);
        this.TeamMemberArray = responseData as Iteammembers[];
      
        // Initialize the selected property for each team member
        this.TeamMemberArray.forEach(member => member.selected = false);

      },
      error => {
        console.error(error);
      }
    );
  }
  getEmployee() {
    this.subscription = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
      next: (data: any) => {
        this.employees = data;
  
        // Use a Set to keep track of unique employeeIds
        const uniqueEmployeeIdsSet = new Set();
  
        // Filter out duplicate records and records without fusionEmpId
        this.employees = this.employees.filter((employee: any) => {
          if (employee.fusionEmpId !== null && employee.fusionEmpId !== undefined) {
            // Check for duplicate employeeIds
            if (!uniqueEmployeeIdsSet.has(employee.employeeId)) {
              uniqueEmployeeIdsSet.add(employee.employeeId);
              return true;
            }
          }
          return false;
        });
  
        // Logging the data after removing duplicates and records without fusionEmpId
        console.log('Employees (Unique and with fusionEmpId):', this.employees);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  pouptext1: any
  selectedEmployees: Iteammembers[] = [];
  selectedEmployeeIds: string[] = [];
  updateTeamRM() {
    let ManagerId = this.selectedEmployeeIds[0];

    // Prepare the request body
    let requestBody = this.selectedEmployees.map(employee => {
      return {
        jobRole: employee.jobRole,
        firstName: employee.firstName,
        lastName: employee.lastName,
        middleName: employee.middleName,
        workEmail: employee.workEmail,
        fusionEmpId: employee.fusionEmpId,
        employeeId: employee.employeeId,
        contactnumber: employee.contactnumber,
        id: employee.id
      };
    });

  
  
}
}
