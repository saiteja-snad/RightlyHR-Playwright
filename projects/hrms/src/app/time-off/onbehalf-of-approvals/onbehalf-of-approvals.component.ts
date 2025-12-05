import { CommonModule } from '@angular/common';
import { Component, effect, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RbacService } from '../../services/rbac.service';
import { DropdownModule } from 'primeng/dropdown';
import { WfhComponent } from './wfh/wfh.component';
import { PermissionsComponent } from "./permissions/permissions.component";
import { CompOffEntitlementComponent } from "./comp-off-entitlement/comp-off-entitlement.component";
import { TimeOffComponent } from "./time-off/time-off.component";
import { Select } from 'primeng/select';
import { environment } from '../../../environments/environment';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TraineeRequestsComponent } from './trainee-requests/trainee-requests.component';
@Component({
  selector: 'app-onbehalf-of-approvals',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    DropdownModule,
    WfhComponent,
    PermissionsComponent,
    CompOffEntitlementComponent,
    TimeOffComponent,
    Select,
    ModuleInformationComponent,
    NgbPopoverModule,
    FormsModule,
    TraineeRequestsComponent
],
  templateUrl: './onbehalf-of-approvals.component.html',
  styleUrl: './onbehalf-of-approvals.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class OnbehalfOfApprovalsComponent {
  moduleinfo : string = '';
  subscription!: Subscription;
  employeedata = {} as any;
  leaves = [] as any;
  compOff = [] as any;
  wfh = [] as any;
  permissions = [] as any;
  traineeRequests = [] as any;
  teamManagerControl = new FormControl(null);
  timeOffCount = 0;
  compOffCount = 0;
  wfhCount = 0;
  traineeRequestsCount = 0;
  activeTab: string = 'timeOff';
  permissionsCount = 0;
  employeeiddetails = [] as any;
  getEmployeeInfo = [] as any;
  disaplyapplybutton = true;
  selectedEmployeeId: string | null = null;
  selectedMyTeamEmployee: any = null;
  selectedOtherEmployee: any = null;
  empdata = {} as any;

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService, public readonly router: Router) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data?.employeeId) {
          this.employeedata = data;
          this.gettimeoffcount(this.employeedata.employeeId);
          this.getCompoff(this.employeedata.employeeId);
          this.getWfhoff(this.employeedata.employeeId);
          this.getPermissionsoff(this.employeedata.employeeId);
          this.getTraineeRequestsOff(this.employeedata.employeeId)
        }
        // this.http.resetTriggerSignal();
      }
    });
  }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    localStorage.removeItem("onbehalfofaproverData");
    this.getEmployeeId();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.getMyTeamData();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

    onMyTeamChange(event: any): void {
    this.selectedOtherEmployee = null; // Clear the other dropdown
    this.OnclickMyTeam(event);
  }

  onEmployeeChange(event: any): void {
    this.selectedMyTeamEmployee = null; // Clear the My Team dropdown
    this.Onclick(event);
  }

  updateModuleInfo() {
    const url = this.router.url;

    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/on-behalf-of-approvals': MODULE_INFOS.TIME_OFF_ON_BEHALF_OF_APPROVALS_MODULE_INFO
    };

    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    const statuses = 'Active';
    this.subscription = this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).subscribe({
      next: (data: any) => {
        // this.employeeiddetails = data as IemployeeDetails[];
        const employeedata = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''
              }${employee.firstName ? employee.firstName : ''} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName ? employee.lastName : ''}`,
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

  getMyTeamData() {
    this.subscription = this.http
      .getData(`Employeedata/v2/getEmployeesByhierarchy/${this.empdata.employeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response && response.length) {
            // No filter
            this.getEmployeeInfo = response.map((employee: any) => ({
              ...employee,
              fullName: `${
                employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
            }));
          }
        },
      });
  }

   OnclickMyTeam($event: any) {
    if ($event.value) {
      this.employeedata = this.getEmployeeInfo.find((e: any) => e.employeeId == $event.value);
      localStorage.setItem("onbehalfofaproverData", JSON.stringify(this.employeedata));
      this.http.triggerActionSignal();
    }
    else {
      this.employeedata = {};
      this.leaves = [];
      this.compOff = [];
      this.wfh = [];
      this.permissions = [];
      this.traineeRequests = [];
      this.timeOffCount = 0;
      this.compOffCount = 0;
      this.wfhCount = 0;
      this.permissionsCount = 0;
      this.traineeRequestsCount = 0;
      localStorage.setItem("onbehalfofaproverData", JSON.stringify(null));
      this.http.triggerActionSignal();
    }
  }

  Onclick($event: any) {
    if ($event.value) {
      this.employeedata = this.employeeiddetails.find((e: any) => e.employeeId == $event.value);
      localStorage.setItem("onbehalfofaproverData", JSON.stringify(this.employeedata));
      this.http.triggerActionSignal();
    }
    else {
      this.employeedata = {};
      this.leaves = [];
      this.compOff = [];
      this.wfh = [];
      this.permissions = [];
      this.traineeRequests = [];
      this.timeOffCount = 0;
      this.compOffCount = 0;
      this.wfhCount = 0;
      this.permissionsCount = 0;
      this.traineeRequestsCount = 0;
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
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.leavesModuleId}`).subscribe({
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
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.compoffModuleId}`).subscribe({
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
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.wfhModuleId}`).subscribe({
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
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.permissionsModuleId}`).subscribe({
      next: (data: any) => {
        this.permissions = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.permissionsCount = this.permissions.length;
      },
      error: (reason) => {
        this.permissions = [];
      }
    });
  }

  getTraineeRequestsOff(employeeId: any) {
  this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.traineeoffboardingModuleId}`).subscribe({
    next: (data: any) => {
      this.traineeRequests = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
      this.traineeRequestsCount = this.traineeRequests.length;
    },
    error: (reason) => {
      this.traineeRequests = [];
      this.traineeRequestsCount = 0;
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

  traineeRequestsOff(value: any) {
  this.getTraineeRequestsOff(this.employeedata.employeeId);
}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
