import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { WfhComponent } from './wfh/wfh.component';
import { PermissionsComponent } from "./permissions/permissions.component";
import { CompOffEntitlementComponent } from "./comp-off-entitlement/comp-off-entitlement.component";
import { TimeOffComponent } from "./time-off/time-off.component";
@Component({
  selector: 'app-onbehalf-of-approvals',
  imports: [CommonModule, RouterModule, TranslateModule, ReactiveFormsModule, DropdownModule, WfhComponent, PermissionsComponent, CompOffEntitlementComponent, TimeOffComponent],
  templateUrl: './onbehalf-of-approvals.component.html',
  styleUrl: './onbehalf-of-approvals.component.scss'
})

export class OnbehalfOfApprovalsComponent {
  subscription!: Subscription;
  employeedata = {} as any;
  leaves = [] as any;
  compOff = [] as any;
  wfh = [] as any;
  permissions = [] as any;
  teamManagerControl = new FormControl(null);
  timeOffCount = 0;
  compOffCount = 0;
  wfhCount = 0;
  activeTab: string = 'timeOff';
  permissionsCount = 0;
  employeeiddetails = [] as any;

  constructor(private http: HttpService, private authService: AuthService) { }

  ngOnInit(): void {
    localStorage.setItem("onbehalfofaproverData", JSON.stringify(null));
    this.getEmployeeId();
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').subscribe({
      next: (data: any) => {
        // this.employeeiddetails = data as IemployeeDetails[];
        const employeedata = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          };
        });
        this.employeeiddetails = employeedata.filter((element: any) => {
          return element.employeeId != loggedInUser.employeeId;
        });
        // this.employeeiddetailsauthorityName = data as IemployeeDetails[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  Onclick(Value: any) {
    if (Value) {
      this.employeedata = Value;
      localStorage.setItem("onbehalfofaproverData", JSON.stringify(Value));
      this.gettimeoffcount(Value.employeeId);
      this.getCompoff(Value.employeeId);
      this.getWfhoff(Value.employeeId);
      this.getPermissionsoff(Value.employeeId);
      this.http.triggerActionSignal();
    }
    else {
      this.employeedata = {};
      this.leaves = [];
      this.compOff = [];
      this.wfh = [];
      this.permissions = [];
      this.timeOffCount = 0;
      this.compOffCount = 0;
      this.wfhCount = 0;
      this.permissionsCount = 0;
      localStorage.setItem("onbehalfofaproverData", JSON.stringify(null));
      this.http.triggerActionSignal();
    }
  }

  getParsedEmployee(event: Event): any {
    const target = event.target as HTMLSelectElement;
    return JSON.parse(target.value);
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  gettimeoffcount(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=1&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.leaves = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.timeOffCount = this.leaves.length;
      },
      error: (reason) => {
        this.leaves = [];
      }
    });
  }

  getCompoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=3&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.compOff = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.compOffCount = this.compOff.length;
      },
      error: (reason) => {
        this.compOff = [];
      }
    });
  }

  getWfhoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=2&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.wfh = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.wfhCount = this.wfh.length;
      },
      error: (reason) => {
        this.wfh = [];
      }
    });
  }

  getPermissionsoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=21&approvedType=EMP`).subscribe({
      next: (data: any) => {
        this.permissions = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.permissionsCount = this.permissions.length;
      },
      error: (reason) => {
        this.permissions = [];
      }
    });
  }

  timeoff(Value: any) {
    this.gettimeoffcount(this.employeedata.employeeId);
  }

  compoff(Value: any) {
    this.getCompoff(this.employeedata.employeeId);
  }

  wfhoff(Value: any) {
    this.getWfhoff(this.employeedata.employeeId)
  }

  permissionsoff(value: any) {
    this.getPermissionsoff(this.employeedata.employeeId)
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
