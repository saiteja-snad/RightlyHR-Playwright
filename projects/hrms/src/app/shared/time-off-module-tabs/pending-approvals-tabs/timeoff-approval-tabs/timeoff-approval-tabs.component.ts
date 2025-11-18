
import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { SidetabsloadersComponent } from '../../../sidetabsloaders/sidetabsloaders.component';
interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-timeoff-approval-tabs',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './timeoff-approval-tabs.component.html',
  styleUrl: './timeoff-approval-tabs.component.scss'
})

export class TimeoffApprovalTabsComponent {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  countEmp: any;
  countRole: any;
  loading = false;
  nodue_Request_data = [] as any[];
  navLinks: NavLink[] = [
    {
      label: 'Leaves',
      route: '/pending-approvals/time-off/leaves',
      moduleId: environment.leavesModuleId,
      permission: { feature: 'Time Off Tab', action: 'view' },
      icon: '/time-off-icon/leaves-icon.png',
    },
    {
      label: 'WFH',
      route: '/pending-approvals/time-off/wfh',
      moduleId: environment.wfhModuleId,
      icon: '/time-off-icon/WFH-icon.png',
      permission: { feature: 'WFH Tab', action: 'view' },
    },
    {
      label: 'Remote Login',
      route: '/pending-approvals/time-off/remote',
      moduleId: environment.remoteLoginModuleId,
      icon: '/time-off-icon/remote-login-icon.png',
      permission: { feature: 'Remote Login Tab', action: 'view' },
    },
    {
      label: 'Comp-Off',
      route: '/pending-approvals/time-off/comp-off',
      moduleId: environment.compoffModuleId,
      icon: '/time-off-icon/comp-off.png',
      permission: { feature: 'Comp Off Tab', action: 'view' },
    },
    {
      label: 'Permissions',
      route: '/pending-approvals/time-off/permissions',
      moduleId: environment.permissionsModuleId,
      icon: '/time-off-icon/permissions-icon.png',
      permission: { feature: 'Permissions Tab', action: 'view' },
    },
    {
      label: 'Extra Hours',
      route: '/pending-approvals/time-off/extra-hours-request',
      moduleId: environment.extraHoursModuleId,
      icon: '/time-off-icon/extra-logs.png',
      permission: { feature: 'Extra Hours Tab', action: 'view' },
    },
    {
      label: 'Regularizations',
      route: '/pending-approvals/time-off/regularization-request',
      moduleId: environment.attendanceRegularizationModuleId,
      icon: '/time-off-icon/regularization-icon.png',
      permission: { feature: 'Regularization Tab', action: 'view' },
    },
  ];

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
    private signalService: SignalsService, private accessNav: AccessNavigationService) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().wfh) {
        this.getAllPendingApprovalsCount();
        this.getAllPendingApprovalsNoDue();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          wfh: status.wfh ? false : status.wfh,
        }));
      }
      if (this.signalService.timeOffsidenavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.timeOffsidenavCountSignal.set(false);
      }
      if (this.signalService.wfhSidNavCountTriggerSignal()) {
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
    });
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsCount();
    this.navLinks = this.navLinks.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
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
    this.loading = true;
    const employeeId = parseInt(this.LOGIN.employeeId);
    this.http.getAllPendingApprovalsCount(undefined, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const countMap = new Map<number, number>();
        data.forEach((item) => countMap.set(item.moduleId, item.totalCount));
        this.navLinks = this.navLinks.map((link) => ({
          ...link,
          count: countMap.get(link.moduleId) || 0,
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching approvals:', err);
        this.loading = false;
      },
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