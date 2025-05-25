import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegularizationTabsComponent } from "../../shared/time-off-module-tabs/regularization-tabs/regularization-tabs.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../services/form-validations.service';
import { RbacService } from '../../services/rbac.service';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-regularization',
  imports: [RouterModule, RegularizationTabsComponent, TranslateModule, CommonModule, Select],
  templateUrl: './regularization.component.html',
  styleUrl: './regularization.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class RegularizationComponent {
  subscription!: Subscription;
  ApprovedCount = 0;
  rejectedCount = 0;
  ProcessedCount = 0;
  pendingCount = 0;
  regularize = [];
  emp: any;
  getEmployeeInfo: any;

  constructor(private http: HttpService, public rbac: RbacService, public formsValidation: FormValidationsService) { }

  ngOnInit(): void {
    this.emp = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getTeamManagersDetails();
  }

  // function to get the data of employees by hierarchy
  getTeamManagersDetails() {
    const EmployeeId = this.emp.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          // No filter
          this.getEmployeeInfo = response.map((employee: any) => ({
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          }));
          console.log('getEmployeeInfo', this.getEmployeeInfo);
        }
      },
    });
  }

  onCheckemployee(employeedId: any) {
    this.http.setEmployeeIdRegularization(employeedId);
    this.ProcessedCount = 0;
    this.rejectedCount = 0;
    this.ApprovedCount = 0;
    this.pendingCount = 0;
    this.regularize = [];
    if (employeedId) {
      this.getPermission(employeedId);
    } else {
      this.getPermission(this.emp.employeeId);
    }
  }

  getPermission(employeedId?: any) {
    // let empId = this.empinfo.employeeId
    // console.log(empId);
    // this.subscription = this.http.getData(`AttendanceRequests/getbyempid/${empId}`).subscribe({
    let empId = employeedId
    this.subscription = this.http.getData(`RegularizationRequests/attendance/${empId}`).subscribe({
      next: (response: any) => {
        this.regularize = response
        //  console.log(this.regularize[0].startTime)
        this.regularize.forEach((element: { status: string }) => {
          if (element.status === 'Waiting for Approval') {
            this.pendingCount++;
          }
          if (element.status === 'Approved') {
            this.ApprovedCount++
          }
          if (element.status === 'Rejected') {
            this.rejectedCount++
          }
          if (element.status === 'Processed') {
            this.ProcessedCount++
          }
        });
      },
      error: (reason: any) => console.log(reason)
    })
  }
}