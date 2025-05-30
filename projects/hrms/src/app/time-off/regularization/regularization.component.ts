import { Component, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RegularizationTabsComponent } from "../../shared/time-off-module-tabs/regularization-tabs/regularization-tabs.component";
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../services/form-validations.service';
import { RbacService } from '../../services/rbac.service';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-regularization',
  imports: [RouterModule,ReactiveFormsModule, RegularizationTabsComponent, TranslateModule, CommonModule, Select, ModuleInformationComponent,NgbPopoverModule],
  templateUrl: './regularization.component.html',
  styleUrl: './regularization.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class RegularizationComponent {
  moduleinfo : string = '';
  subscription!: Subscription;
  ApprovedCount = 0;
  rejectedCount = 0;
  ProcessedCount = 0;
  pendingCount = 0;
  regularize = [];
  emp: any;
  getEmployeeInfo: any;

  constructor(private http: HttpService, public rbac: RbacService, public formsValidation: FormValidationsService, public readonly router: Router) { }

  ngOnInit(): void {
    this.emp = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getTeamManagersDetails();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/regularization': MODULE_INFOS.ATTENDANCE_REGULARIZATION_REPORTS_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
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
       this.http.setEmployeeIdRegularization(null);
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