import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApprovalStatusCount } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { SignalsService } from '../../../services/signals.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-pending-approvals-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-approvals-tabs.component.html',
  styleUrl: './pending-approvals-tabs.component.scss',
})

export class PendingApprovalsTabsComponent {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  countEmp: any;
  countRole: any;
  nodue_Request_data = [] as any[];
  navLinks: NavLink[] = [
    {
      label: 'Time-Off',
      route: '/time-off/pending-approvals/time-off-request',
      moduleId: environment.leavesModuleId, permission: { feature: 'Time Off Tab', action: 'view' },
      icon: '/time-off-icon/leaves-icon.png',
    },
    { label: 'WFH', route: '/time-off/pending-approvals/wfh', moduleId: environment.wfhModuleId, icon: '/time-off-icon/WFH-icon.png', permission: { feature: 'WFH Tab', action: 'view' } },
    { label: 'Comp-Off', route: '/time-off/pending-approvals/comp-off', moduleId: environment.compoffModuleId, icon: '/time-off-icon/comp-off.png', permission: { feature: 'Comp Off Tab', action: 'view' } },
    { label: 'Permissions', route: '/time-off/pending-approvals/permissions', moduleId: environment.permissionsModuleId, icon: '/time-off-icon/permissions-icon.png', permission: { feature: 'Permissions Tab', action: 'view' } },
    { label: 'Regularizations', route: '/time-off/pending-approvals/regularization-request', moduleId: environment.attendanceRegularizationModuleId, icon: '/time-off-icon/regularization-icon.png', permission: { feature: 'Regularization Tab', action: 'view' } },
    {
      label: 'Separations',
      route: '/time-off/pending-approvals/separation-request',
      moduleId: environment.SeparationrequestmoduleId, permission: { feature: 'Separation Request Tab', action: 'view' },
      icon: '/time-off-icon/seperation-icon.png',
    },
    {
      label: 'Recalls',
      route: '/time-off/pending-approvals/recall-request',
      moduleId: environment.RecallrequestmoduleId, permission: { feature: 'Recall Request Tab', action: 'view' },
      icon: '/time-off-icon/recall-icon.png',
    },
    {
      label: 'Trainees', route: '/time-off/pending-approvals/trainee-approvals',
      moduleId: environment.traineeoffboardingModuleId, permission: { feature: 'Trainee Details Tab', action: 'view' },
      icon: '/time-off-icon/trainee-icon.png',
    },
    {
      label: 'No Due Clearances',
      route: '/time-off/pending-approvals/nodue-request',
      moduleId: environment.nodueModuleId, permission: { feature: 'No Due Clearence Requests Tab', action: 'view' },
      icon: '/time-off-icon/No-due-icon.png',
    },
    {
      label: 'Claims and Expenses',
      route: '/time-off/pending-approvals/claimsandexpenses-request',
      moduleId: environment.expensesModuleId, permission: { feature: 'Claims and Expenses Tab', action: 'view' },
      icon: '/main-menu-icons/expenses-icon.png',
    },
    {
      label: 'Desks',
      route: '/time-off/pending-approvals/desk-approval',
      moduleId: environment.deskAllocationModuleId, permission: { feature: 'Desk Requests Tab', action: 'view' },
      icon: '/main-menu-icons/desk-icon.png',
    },
    {
      label: 'Probations',
      route: '/time-off/pending-approvals/probation-request',
      moduleId: environment.ProbationrequestmoduleId, permission: { feature: 'Probation Details Tab', action: 'view' },
      icon: '/time-off-icon/Probation-icon.png',
    },
  ];

  constructor(
    public readonly router: Router,
    private http: HttpService, public rbac: RbacService,
    private signalService: SignalsService,
    private accessNav: AccessNavigationService) {
    effect(() => {
      if ((this.http.tirggerPendingApprovalCountSignal().wfh) || (this.http.tirggerPendingApprovalCountSignal().separation)
        || (this.http.tirggerPendingApprovalCountSignal().nodue)) {
        this.getAllPendingApprovalsCount();
        this.getAllPendingApprovalsNoDue();
        this.http.tirggerPendingApprovalCountSignal.update(status => ({
          ...status,
          wfh: status.wfh ? false : status.wfh,
          separation: status.separation ? false : status.separation,
          nodue: status.nodue ? false : status.nodue,
        }));
      }
      if(this.signalService.timeOffsidenavCountSignal()){
        this.getAllPendingApprovalsCount();
        this.signalService.timeOffsidenavCountSignal.set(false);
      }
      if(this.signalService.wfhSidNavCountTriggerSignal()){
        this.getAllPendingApprovalsCount();
        this.signalService.wfhSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.permissionSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.permissionSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.compOffSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.compOffSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.regularizationSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.regularizationSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.separationSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.separationSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.recallSeparationSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.recallSeparationSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.noDueSideNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.noDueSideNavCountTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsCount();
    this.getAllPendingApprovalsNoDue();
    this.navLinks = this.navLinks.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`));
  }

  getAllPendingApprovalsNoDue() {
    const EmployeeId = this.LOGIN.employeeId;
    this.subscription = this.http.getData(`NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.nodue_Request_data = data;
      },
    });
  }

  getAllPendingApprovalsCount() {
    const employeeId = parseInt(this.LOGIN.employeeId);
    this.http.getAllPendingApprovalsCount(undefined, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const countMap = new Map<number, number>();
        data.forEach(item => countMap.set(item.moduleId, item.totalCount));
        this.navLinks = this.navLinks.map(link => ({
          ...link,
          count: countMap.get(link.moduleId) || 0
        }));
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}