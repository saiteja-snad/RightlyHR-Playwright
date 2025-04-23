import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { LeaveApproval } from '../../Interfaces/pendingapprovalsmodel';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalStatusCount } from '../../Interfaces/timoff-model';
import { environment } from '../../../environments/environment';
import { RbacService } from '../../services/rbac.service';

interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
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
      moduleId: environment.leavesModuleId, permission: { feature: 'Timeoff Tab', action: 'view' }
    },
    { label: 'WFH', route: '/time-off/pending-approvals/wfh', moduleId: environment.wfhModuleId, permission: { feature: 'Workfromhome Tab', action: 'view' } },
    { label: 'Comp-Off', route: '/time-off/pending-approvals/comp-off', moduleId: environment.compoffModuleId, permission: { feature: 'Compoff Tab', action: 'view' } },
    { label: 'Permissions', route: '/time-off/pending-approvals/permissions', moduleId: environment.permissionsModuleId, permission: { feature: 'Permissions Tab', action: 'view' } },
    { label: 'Regularization', route: '/time-off/pending-approvals/regularization-request', moduleId: environment.attendanceRegularizationModuleId, permission: { feature: 'Regularization Tab', action: 'view' } },
    {
      label: 'Separation Requests',
      route: '/time-off/pending-approvals/separation-request',
      moduleId: environment.SeparationrequestmoduleId, permission: { feature: 'Separation Requests Tab', action: 'view' }
    },
    {
      label: 'Recall Requests',
      route: '/time-off/pending-approvals/recall-request',
      moduleId: environment.RecallrequestmoduleId, permission: { feature: 'Recall Tab', action: 'view' }
    },
    {
      label: 'Trainee Details', route: '/time-off/pending-approvals/trainee-approvals',
      moduleId: environment.traineeoffboardingModuleId, permission: { feature: 'Trainee Tab', action: 'view' }
    },
    {
      label: 'No Due Clearance Requests',
      route: '/time-off/pending-approvals/nodue-request',
      moduleId: environment.nodueModuleId, permission: { feature: 'No Due Clearance Tab', action: 'view' }
    },
    {
      label: 'Claims and Expenses',
      route: '/time-off/pending-approvals/claimsandexpenses-request',
      moduleId: environment.expensesModuleId, permission: { feature: 'Expenses Tab', action: 'view' }
    },
    {
      label: 'Desk Request',
      route: '/time-off/pending-approvals/desk-approval',
      moduleId: environment.deskAllocationModuleId,
    },

    {
      label: 'Probation Details',
      route: '/time-off/pending-approvals/probation-request',
      moduleId: environment.ProbationrequestmoduleId, permission: { feature: 'Probation Details Tab', action: 'view' }
    },
  ];
  constructor(
    public readonly router: Router,
    private http: HttpService, public rbac: RbacService
  ) {
    effect(() => {
      if ((this.http.tirggerPendingApprovalCountSignal().wfh) || (this.http.tirggerPendingApprovalCountSignal().separation)
        || (this.http.tirggerPendingApprovalCountSignal().nodue)) {
        this.getAllPendingApprovalsCount();
        this.getAllPendingApprovalsNoDue();
        this.http
          .tirggerPendingApprovalCountSignal
          .update((status) => ({ ...status, wfh: false, separation: false, nodue: false }));
      }


    });
  }

  isActive(router: string): boolean {
    return this.router.isActive(router, true);
  }
  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsCount();
    this.getAllPendingApprovalsNoDue();
  }
  getAllPendingApprovalsNoDue() {
    const EmployeeId = this.LOGIN.employeeId;
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(
        `NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);
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


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
