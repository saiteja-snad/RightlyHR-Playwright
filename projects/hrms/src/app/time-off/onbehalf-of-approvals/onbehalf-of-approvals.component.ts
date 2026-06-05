import { CommonModule } from '@angular/common';
import { Component, effect, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { RegularizationComponent } from './regularization/regularization.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { TraineeRequestsComponent } from './trainee-requests/trainee-requests.component';
import { SeperationRequestsComponent } from "./seperation-requests/seperation-requests.component";
import { SeperationRecallRequestsComponent } from "./seperation-recall-requests/seperation-recall-requests.component";
import { NodueRequestsComponent } from "./nodue-requests/nodue-requests.component";
import { ProbationRequestsComponent } from "./probation-requests/probation-requests.component";

import { RemoteLoginRequestsComponent } from "./remote-login-requests/remote-login-requests.component";
import { ExtraLogHoursComponent } from './extra-log-hours/extra-log-hours.component';
import { EmployeeInfoRequestsComponent } from './employee-info-requests/employee-info-requests.component';
import { TimesheetRequestsComponent } from "./timesheet-requests/timesheet-requests.component";
import { SignalsService } from '../../services/signals.service';
import { IResourceDetail } from '../../timesheetmodel';
import dayjs, { Dayjs } from 'dayjs';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../shared/tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../services/theme-service/menu-order.service';
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
    RegularizationComponent,
    Select,
    ModuleInformationComponent,
    NgbPopoverModule,
    FormsModule,
    ModuleInfoIconComponent,
    TraineeRequestsComponent,
    SeperationRequestsComponent,
    SeperationRecallRequestsComponent,
    NodueRequestsComponent,
    ProbationRequestsComponent,
    RemoteLoginRequestsComponent,
    ExtraLogHoursComponent,
    EmployeeInfoRequestsComponent,
    TimesheetRequestsComponent,
    MultiSelectModule,
    DatePicker,
    DragDropModule,
    TabsDndDirective
],

  templateUrl: './onbehalf-of-approvals.component.html',
  styleUrl: './onbehalf-of-approvals.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class OnbehalfOfApprovalsComponent {
  moduleinfo: string = '';
  subscription!: Subscription;
  employeedata = {} as any;
  leaves = [] as any;
  compOff = [] as any;
  wfh = [] as any;
  permissions = [] as any;
  datepickerForm!: FormGroup;
  expenses = [] as any;

  regularization = [] as any;

  traineeRequests = [] as any;
  seperationRequests = [] as any;
  recalls = [] as any;
  probationRequests = [] as any;

  remoteLogin = [] as any;
  extraHours = [] as any;
  timesheetRequests = [] as any;


  teamManagerControl = new FormControl(null);
  timeOffCount = 0;
  compOffCount = 0;
  expensesCount = 0;
  wfhCount = 0;
  recallsCount = 0;
  nodueCount = 0;
  separationsCount = 0;
  employeeInfoCount = 0;
  remoteLoginCount = 0;
  extraHoursCount = 0;
  traineeRequestsCount = 0;
  activeTab: string = 'timeOff';
  permissionsCount = 0;
  regularizationCount = 0;
  probationRequestsCount = 0;
  timesheetRequestsCount = 0;
  employeeiddetails = [] as any;
  getEmployeeInfo = [] as any;
  disaplyapplybutton = true;
  selectedEmployeeId: string | null = null;
  selectedMyTeamEmployee: any = null;
  selectedOtherEmployee: any = null;
  empdata = {} as any;
  destroy$ = new Subject<boolean>();
  resourcesList: any[] = [];
  projectsData: any[] = [];
  empinfo: any;
  phaseIds: any[] = [];
  employeeid: any;
  selectedResourceIds: any[] = [];
  isSubmitEnabled = false;
  isDistinct = true;
  employeeData: any[] = [];
  today: Date = new Date();
tastType: any[] = [];
  readonly tabsKey = 'onbehalf-of-approvals-main-tabs';
  navItems: any[] = [];
  filteredNavItems: any[] = [];
  constructor(private http: HttpService,
              private authService: AuthService,
              public rbac: RbacService,
              public readonly router: Router,
              private signalService: SignalsService,
             private offcanvasService: NgbOffcanvas,
            private fb: FormBuilder,
            private menuOrderService: MenuOrderService) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.trigger() || this.signalService.onBhehalfOfApprovalSignal() || this.signalService.separationForYouTriggerSignal()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data?.employeeId) {
          this.employeedata = data;
          this.gettimeoffcount(this.employeedata.employeeId);
          this.getCompoff(this.employeedata.employeeId);
          this.getWfhoff(this.employeedata.employeeId);
          this.getPermissionsoff(this.employeedata.employeeId);
          this.getExpensesoff(this.employeedata.employeeId)
          this.getRegularizationoff(this.employeedata.employeeId);


          this.getTraineeRequestsOff(this.employeedata.employeeId);
          this.getProbationRequestCount(this.employeedata.employeeId);
          this.remoteLoginoff(this.employeedata.employeeId);
          this.getExtraHoursoff(this.employeedata.employeeId);
          this.getEmployeeInfoRequests(this.employeedata.employeeId);
          this.getTimesheetRequests(this.employeedata.employeeId);
          this.getResourceDetailsByManagerId();
          this.getAllActiveProjects();
          this.getSeparations(this.employeedata.employeeId);
          this.getRecalls(this.employeedata.employeeId);
          if (this.signalService.separationForYouTriggerSignal()) {
            this.signalService.separationForYouTriggerSignal.set(false);
          }

        }

        if (this.signalService.onBhehalfOfApprovalSignal()) {
          this.signalService.onBhehalfOfApprovalSignal.set(false);
        }
        // this.http.resetTriggerSignal();
      }
    });
  }

  ngOnInit(): void {

    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    localStorage.removeItem("onbehalfofaproverData");
    this.createDatepickerForm();
    this.getEmployeeId();
    this.updateModuleInfo();
    this.getMyTeamData();
    this.datepickerForm.valueChanges.subscribe(() => {
      this.isSubmitEnabled = this.isAnyFieldSelected();
    });
    this.getTaskType();
    this.buildNavItems();
  }

  private buildNavItems(): void {
    const items = [
      { key: 'timeOff', tabId: '/onbehalf-of-approvals/timeOff', label: 'Time Off', icon: '/time-off-icon/leaves-icon.png', countProp: 'timeOffCount', permission: 'Time Off (On Behalf Of Approvals).view' },
      { key: 'compOff', tabId: '/onbehalf-of-approvals/compOff', label: 'Comp Off', icon: '/time-off-icon/comp-off.png', countProp: 'compOffCount', permission: 'Comp Off (On Behalf Of Approvals).view' },
      { key: 'wfh', tabId: '/onbehalf-of-approvals/wfh', label: 'WFH', icon: '/time-off-icon/WFH-icon.png', countProp: 'wfhCount', permission: 'WFH (On Behalf Of Approvals).view' },
      { key: 'permissions', tabId: '/onbehalf-of-approvals/permissions', label: 'Permissions', icon: '/time-off-icon/permissions-icon.png', countProp: 'permissionsCount', permission: 'Permission (On Behalf Of Approvals).view' },
      { key: 'traineeRequests', tabId: '/onbehalf-of-approvals/traineeRequests', label: 'Trainee Requests', icon: '/time-off-icon/trainee-icon.png', countProp: 'traineeRequestsCount', permission: 'Trainee Requests (On Behalf Of Approvals).view' },
      { key: 'regularization', tabId: '/onbehalf-of-approvals/regularization', label: 'Regularization', icon: '/time-off-icon/regularization-icon.png', countProp: 'regularizationCount', permission: 'Regularization (On Behalf Of Approvals).view' },
      { key: 'expenses', tabId: '/onbehalf-of-approvals/expenses', label: 'Expenses', icon: '/main-menu-icons/expenses-icon.png', countProp: 'expensesCount', permission: 'Expenses (On Behalf Of Approvals).view' },
      { key: 'remoteLogin', tabId: '/onbehalf-of-approvals/remoteLogin', label: 'Remote Login', icon: '/time-off-icon/remote-login-icon.png', countProp: 'remoteLoginCount', permission: 'Remote Login (On Behalf Of Approvals).view' },
      { key: 'extraHours', tabId: '/onbehalf-of-approvals/extraHours', label: 'Extra Hours', icon: '/time-off-icon/extra-logs.png', countProp: 'extraHoursCount', permission: 'Extra Hours (On Behalf Of Approvals).view' },
      { key: 'timesheets', tabId: '/onbehalf-of-approvals/timesheets', label: 'Timesheets', icon: '/time-off-icon/calender-activity.png', countProp: 'timesheetRequestsCount', permission: 'Timesheet (On Behalf Of Approvals).view' },
      { key: 'employeeInfo', tabId: '/onbehalf-of-approvals/employeeInfo', label: 'Employee Info', icon: '/time-off-icon/employee-info-approvals.png', countProp: 'employeeInfoCount', permission: 'Employee Info (On Behalf Of Approvals).view' },
      { key: 'probation', tabId: '/onbehalf-of-approvals/probation', label: 'Probation', icon: '/time-off-icon/Probation-icon.png', countProp: 'probationRequestsCount', permission: 'Probation (On Behalf Of Approvals).view' },
      { key: 'separations', tabId: '/onbehalf-of-approvals/separations', label: 'Separations', icon: '/time-off-icon/seperation-icon.png', countProp: 'separationsCount', permission: 'Separations (On Behalf Of Approvals).view' },
      { key: 'recalls', tabId: '/onbehalf-of-approvals/recalls', label: 'Recalls', icon: '/time-off-icon/recall-icon.png', countProp: 'recallsCount', permission: 'Recalls (On Behalf Of Approvals).view' },
      { key: 'nodue', tabId: '/onbehalf-of-approvals/nodue', label: 'No Due', icon: '/time-off-icon/nodue-icon.png', countProp: 'nodueCount', permission: 'No Due (On Behalf Of Approvals).view' }
    ];

    // compute visible tabs by RBAC
    const visible = items.filter(i => this.rbac.allowedToAccess(i.permission));
    this.filteredNavItems = this.menuOrderService.applySavedTabsOrder(this.tabsKey, visible, (t) => t.tabId);
    this.navItems = visible;
  }

  trackByNavId(_: number, item: any): string {
    return item.tabId || item.key;
  }

  getNavItemCount(countProp: string): number {
    switch (countProp) {
      case 'timeOffCount': return this.timeOffCount;
      case 'compOffCount': return this.compOffCount;
      case 'expensesCount': return this.expensesCount;
      case 'wfhCount': return this.wfhCount;
      case 'recallsCount': return this.recallsCount;
      case 'nodueCount': return this.nodueCount;
      case 'separationsCount': return this.separationsCount;
      case 'employeeInfoCount': return this.employeeInfoCount;
      case 'remoteLoginCount': return this.remoteLoginCount;
      case 'extraHoursCount': return this.extraHoursCount;
      case 'traineeRequestsCount': return this.traineeRequestsCount;
      case 'permissionsCount': return this.permissionsCount;
      case 'regularizationCount': return this.regularizationCount;
      case 'probationRequestsCount': return this.probationRequestsCount;
      case 'timesheetRequestsCount': return this.timesheetRequestsCount;
      default: return 0;
    }
  }

getTaskType() {
  this.subscription = this.http.getData('TaskType').subscribe({
    next: (res: any) => {
      this.tastType =res
    },
    error: (error:any) => {
      console.log(error);
    }
  });
}
  initiateUpdateModuleInfo() {
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
    const tabToInfoMap: { [key: string]: string } = {
      'timeOff': MODULE_INFOS.ONBEHALFHALF_APPROVALS_TIME_OFF_MODULE_INFO,
      'compOff': MODULE_INFOS.ONBEHALFHALF_APPROVALS_COMPOFF_MODULE_INFO,
      'wfh': MODULE_INFOS.ONBEHALFHALF_APPROVALS_WFH_MODULE_INFO,
      'permissions': MODULE_INFOS.ONBEHALFHALF_APPROVALS_PERMISSIONS_MODULE_INFO,
      'regularization': MODULE_INFOS.ONBEHALFHALF_APPROVALS_REGULARIZATION_MODULE_INFO,
      'expenses': MODULE_INFOS.ONBEHALFHALF_APPROVALS_EXPENSES_MODULE_INFO,
      'traineeRequests': MODULE_INFOS.ONBEHALFHALF_APPROVALS_TRAINEE_REQUESTS_MODULE_INFO,
      'separations': MODULE_INFOS.ONBEHALFHALF_APPROVALS_SEPARATIONS_MODULE_INFO,
      'recalls': MODULE_INFOS.ONBEHALFHALF_APPROVALS_RECALLS_MODULE_INFO,
      'probation': MODULE_INFOS.ONBEHALFHALF_APPROVALS_PROBATION_REQUESTS_MODULE_INFO,
      'remoteLogin': MODULE_INFOS.ONBEHALFHALF_APPROVALS_REMOTE_LOGIN_MODULE_INFO,
      'extraHours': MODULE_INFOS.ONBEHALFHALF_APPROVALS_EXTRA_HOURS_MODULE_INFO,
      'employeeInfo': MODULE_INFOS.ONBEHALFHALF_APPROVALS_EMPLOYEE_INFO_MODULE_INFO,
      'timesheets': MODULE_INFOS.ONBEHALFHALF_APPROVALS_TIMESHEET_MODULE_INFO
    };
    this.moduleinfo = tabToInfoMap[this.activeTab] ?? '';
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
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
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
      this.recalls = [];
      this.seperationRequests = [];
      this.probationRequests = [];
      this.remoteLogin = [];
      this.extraHours = [];
      this.permissions = [];
      this.regularization = [];
      this.traineeRequests = [];
      this.timesheetRequests = [];

      this.timeOffCount = 0;
      this.compOffCount = 0;
      this.wfhCount = 0;
      this.nodueCount = 0;
      this.recallsCount = 0;
      this.separationsCount = 0;
      this.employeeInfoCount = 0;
      this.timesheetRequestsCount = 0;
      this.remoteLoginCount = 0;
      this.extraHoursCount = 0;
      this.permissionsCount = 0;
      this.probationRequestsCount = 0;

      this.expensesCount = 0;

      this.regularizationCount = 0;

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
      this.recalls = [];
      this.seperationRequests = [];
      this.probationRequests = [];
      this.timesheetRequests = [];
      this.remoteLogin = [];
      this.extraHours = [];
      this.permissions = [];
      this.regularization = [];
      this.traineeRequests = [];
      this.timeOffCount = 0;
      this.compOffCount = 0;
      this.expensesCount = 0;
      this.wfhCount = 0;
      this.nodueCount = 0;
      this.recallsCount = 0;
      this.separationsCount = 0;
      this.probationRequestsCount = 0;
      this.employeeInfoCount = 0;
      this.timesheetRequestsCount = 0;
      this.remoteLoginCount = 0;
      this.extraHoursCount = 0;
      this.permissionsCount = 0;
      this.regularizationCount = 0;
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
    this.updateModuleInfo();
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

  getSeparations(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.SeparationrequestmoduleId}`).subscribe({
      next: (data: any) => {
        this.seperationRequests = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.separationsCount = this.seperationRequests.length;
      },
      error: (reason) => {
        this.seperationRequests = [];
        this.separationsCount = 0;
      }
    });
  }

  getRecalls(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.RecallrequestmoduleId}`).subscribe({
      next: (data: any) => {
        this.recalls = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.recallsCount = this.recalls.length;
      },
      error: (reason) => {
        this.recalls = [];
        this.recallsCount = 0;
      }
    });
  }


  getProbationRequestCount(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.ProbationrequestmoduleId}`).subscribe({
      next: (data: any) => {
        this.probationRequests = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.probationRequestsCount = this.probationRequests.length;
      },
      error: (reason) => {
        this.probationRequests = [];
        this.probationRequestsCount = 0;
      }
    });
  }


  getTimesheetRequests(employeeId: any) {
    this.subscription = this.http
      .getData(`PendingApproval/getApprovalStatusCounts?EmployeeId=${employeeId}&moduleId=${environment.timesheetModuleId}`)
      .subscribe({
        next: (data: any) => {
          const moduleData = (data as any[])?.find(
            x => x.moduleId === environment.timesheetModuleId
          );

          this.timesheetRequestsCount = moduleData?.totalCount ?? 0;
        },
        error: () => {
          this.timesheetRequestsCount = 0;
        }
      });
  }


  getRemoteLoginoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.remoteLoginModuleId}`).subscribe({
      next: (data: any) => {
        this.remoteLogin = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.remoteLoginCount = this.remoteLogin.length;
      },
      error: (reason) => {
        this.remoteLogin = [];
      }
    });
  }

  getPermissionsoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.permissionsModuleId}`).subscribe({
      next: (data: any) => {
        console.log(data)
        this.permissions = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.permissionsCount = this.permissions.length;
      },
      error: (reason) => {
        this.permissions = [];
      }
    });
  }

  getEmployeeInfoRequests(employeeId: any) {
    this.subscription = this.http
      .getData(`PendingApproval/getApprovalStatusCounts?EmployeeId=${employeeId}&moduleId=${environment.pendingapprovalemployeid}`)
      .subscribe({
        next: (data: any) => {
          const moduleData = (data as any[])?.find(
            x => x.moduleId === environment.pendingapprovalemployeid
          );

          this.employeeInfoCount = moduleData?.totalCount ?? 0;
        },
        error: () => {
          this.employeeInfoCount = 0;
        }
      });
  }
  getExpensesoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.expensesModuleId}`).subscribe({
      next: (data: any) => {
        console.log(data)
        this.expenses = data.data.filter((item: any) => item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected');
        this.expensesCount = this.expenses.length;
      },
      error: (reason) => {
        this.expenses = [];
      }
    });
  }


  getRegularizationoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.attendanceRegularizationModuleId}`).subscribe({
      next: (data: any) => {
        this.regularization = data.data.filter((item: any) => item.approvalHeader.status !== 'Processed' && item.approvalHeader.status !== 'Rejected');
        this.regularizationCount = this.regularization.length;
      },
      error: (reason) => {
        this.regularization = [];
        this.regularizationCount = 0;
      }
    });
  }

  getExtraHoursoff(employeeId: any) {
    this.subscription = this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.extraHoursModuleId}`).subscribe({
      next: (data: any) => {
        this.extraHours = data.data.filter((item: any) => item.approvalHeader.status !== 'Processed' && item.approvalHeader.status !== 'Rejected');
        this.extraHoursCount = this.extraHours.length;
      },
      error: (reason) => {
        this.extraHours = [];
        this.extraHoursCount = 0;
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

  getAllPendingApprovalsNoDue(EmployeeId: any) {
    this.subscription = this.http
      .getData(
        `NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`
      )
      .subscribe({
        next: (data: any) => {
          this.nodueCount = data.length;
        },
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
  timesheetRequestsOff(Value: any) {
    this.getTimesheetRequests(this.employeedata.employeeId)
  }

  remoteLoginoff(Value: any) {
    this.getRemoteLoginoff(this.employeedata.employeeId)
  }

  extraHoursOff(value: any) {
    this.getExtraHoursoff(this.employeedata.employeeId);
  }

  permissionsoff(value: any) {
    this.getPermissionsoff(this.employeedata.employeeId)
  }
  expensesoff(value: any) {
    this.getExpensesoff(this.employeedata.employeeId)
  }

  separationsOff(value: any) {
    this.getSeparations(this.employeedata.employeeId)
  }

  recallOff(value: any) {
    this.getRecalls(this.employeedata.employeeId)
  }

  noDueOff(value: any) {
    this.getAllPendingApprovalsNoDue(this.employeedata.employeeId);
  }


  employeeInfoOff(value: any) {
    this.getEmployeeInfoRequests(this.employeedata.employeeId);
  }



  regularizationoff(value: any) {
    this.getRegularizationoff(this.employeedata.employeeId);
  }

  traineeRequestsOff(value: any) {
    this.getTraineeRequestsOff(this.employeedata.employeeId);
  }
  /** Create form and keep Phase & Resource disabled initially */
  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null],
      phaseId: [[]],
      resourceId: [[]],
      taskId: [[]]
    });
  }
  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  onresourceChange(event: any) {
    const selectedResourceIds = event?.value ?? [];
    this.selectedResourceIds = selectedResourceIds;
    this.getAllActiveProjects();
  }

  isAnyFieldSelected(): boolean {
    const formValue = this.datepickerForm?.value;
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0) ||
      (Array.isArray(formValue?.phaseId) && formValue.phaseId.length > 0) ||
      (Array.isArray(formValue?.resourceId) && formValue.resourceId.length > 0) ||
      (Array.isArray(formValue?.taskId) && formValue.taskId.length > 0)

    );
  }
  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  /** Get all phases for the current employee */
  getAllActiveProjects() {
    let url = `Project/authorities/${this.employeedata?.employeeId}/projects`;
    if (this.selectedResourceIds?.length > 0) {
      const resourceIds = this.selectedResourceIds.join(',');
      url += `?resourceIds=${resourceIds}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const projects = res?.data || [];
        this.projectsData = projects.map((p: any) => ({
          ...p,
          displayName: `${p.clientName} - ${p.projectName} - ${p.phaseName}`,
        }));
        this.projectsData.unshift({
          phaseId: 0,
          displayName: 'No Client - No Project',
        });
        // FIX: Prevent null values from appearing in dropdown
        let selectedPhases = this.datepickerForm.get('phaseId')?.value;
        if (Array.isArray(selectedPhases)) {
          // Remove nulls
          selectedPhases = selectedPhases.filter((x: any) => x !== null);
          // Keep only valid phaseIds
          selectedPhases = selectedPhases.filter((id: number) =>
            this.projectsData.some((p) => p.phaseId === id)
          );
          // Set cleaned value back
          this.datepickerForm.get('phaseId')?.setValue(selectedPhases);
        }
      },
      error: () => (this.projectsData = []),
    });
  }

  /** When phase selected */
  onProjectChange(event: any) {
    const selectedPhaseIds = event?.value ?? [];
    this.phaseIds = selectedPhaseIds;
    this.getResourceDetailsByManagerId();
  }

  getResourceDetailsByManagerId() {
    const EmployeeId = this.employeedata?.employeeId;
    let url = `Timesheet/authority/${EmployeeId}/employees`;
    if (this.phaseIds?.length > 0) {
      const phaseIds = this.phaseIds.join(',');
      url += `?phaseIds=${phaseIds}`;
    }
    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.resourcesList = res.data.map((emp: IResourceDetail) => ({
            ...emp,
            fullName: emp?.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp?.name,
          }));
          // Check if selected resource is still valid and remove nulls
          let selectedResources = this.datepickerForm.get('resourceId')?.value || [];
          if (Array.isArray(selectedResources)) {
            // Remove nulls
            selectedResources = selectedResources.filter((x: any) => x !== null);
            // Keep only valid resource IDs
            selectedResources = selectedResources.filter((id: number) =>
              this.resourcesList.some((r) => r.id === id)
            );
            // Set cleaned value back
            this.datepickerForm.get('resourceId')?.setValue(selectedResources);
            // Update component property to match form
            this.selectedResourceIds = selectedResources;
          }
        } else {
          this.resourcesList = [];
          this.datepickerForm.get('resourceId')?.setValue([]);
          this.selectedResourceIds = [];
        }
      },
      error: () => {
        this.resourcesList = [];
        this.datepickerForm.get('resourceId')?.setValue([]);
        this.selectedResourceIds = [];
      },
    });
  }
  spinnerLoader1 = false;
  /** On form submit */
  onSubmit() {
    this.spinnerLoader1 = true;
    const formValue = this.datepickerForm.value;
    const dateRange = formValue.dateRange;
    const phaseIds = formValue.phaseId || [];
    const resourceIds = formValue.resourceId || [];
    const phaseId = phaseIds.length > 0 ? phaseIds.join(',') : null;
    const resourceId = resourceIds.length > 0 ? resourceIds.join(',') : null;
    const taskIds = formValue.taskId || [];
    const taskId = taskIds.length > 0 ? formValue.taskId.join(', ') : null;
    const request: any = {
      phaseId,
      resourceId,
      taskId
    };
    // Add dateRange only if selected
    if (dateRange && dateRange.length === 2) {
      request.dateRange = {
        startDate: dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
      };
    }
    // Pass the request data to the timesheet component
    this.http.setEmployeeIdTimesheet(this.employeedata?.employeeId, phaseId || 0, request);
    this.spinnerLoader1 = false;
    this.closeCanvas();
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm?.value;
    return (
      (formValue?.dateRange && formValue?.dateRange?.length > 0) ||
      (Array.isArray(formValue?.phaseId) && formValue.phaseId.length > 0) ||
      (Array.isArray(formValue?.resourceId) && formValue.resourceId.length > 0) ||
      (Array.isArray(formValue?.taskId) && formValue.taskId.length > 0)
    );
  }

  resetForm() {
    this.datepickerForm.reset({
      dateRange: null,
      phaseId: [],
      resourceId: [],
      taskId: []
    });
    this.phaseIds = [];
    this.selectedResourceIds = [];
    this.employeeData = [];
    this.isSubmitEnabled = false;
    this.http.setEmployeeIdTimesheet(this.employeedata?.employeeId, 0, null);
    this.getResourceDetailsByManagerId();
    this.getAllActiveProjects();
  }


  probationRequest(value: any) {
    this.getProbationRequestCount(this.employeedata.employeeId);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdTimesheet({}, 0, null);
  }
}
