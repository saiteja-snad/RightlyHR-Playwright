import { Component, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
@Component({
  selector: 'app-leaves-approvaltabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './leaves-approvaltabs.component.html',
  styleUrl: './leaves-approvaltabs.component.scss',
})

export class LeavesApprovaltabsComponent {
  loggedinuser = {} as any;
  empdata = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  processedCount: any;
  waitingForApprovalCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;
  cancelCount: number = 0;
  teamLeaveBalanceCount: number = 0;
  teamLeaveSummaryCount: number = 0;
  statusTabs: any[] = [];

  constructor(public readonly router: Router, private http: HttpService, private authService: AuthService,
     private signalService: SignalsService, private rbac: RbacService) {
    effect(() => {
      if (this.signalService.timecountTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getDataByLPID();
        this.getAllTeamLeaveBalance();
        this.getAllTeamLeaveSummary();
        // Conditionally reset the signals based on their current state
        if (this.signalService.timecountTriggerSignal()) {
          this.signalService.timecountTriggerSignal.set(false);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getDataByLPID();
    this.getAllTeamLeaveBalance();
    this.getAllTeamLeaveSummary();
  }

  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          const cancelled = response.filter(item => item.status === 'Cancelled');
          this.waitingForApprovalCount = waiting.length;
          this.approvedCount = approved.length;
          this.rejectedCount = rejected.length;
          this.processedCount = processed.length;
          this.cancelCount = cancelled.length
          this.updateStatusTabs();
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getAllTeamLeaveBalance() {
    const employeeId = this.empdata.employeeId;
    let url = `LeaveEntitlements/team-leave-entitlements/${employeeId}`;
    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.data)) {
          this.teamLeaveBalanceCount = res.data.length;
          this.updateStatusTabs();
        }
      },
      error: (err) => {
        this.teamLeaveBalanceCount = 0;
        this.updateStatusTabs();
      },
    });
  }

  getAllTeamLeaveSummary() {
    const employeeId = this.empdata.employeeId;
    let url = `Employeedata/v1/getreportessdata?employeeId=${employeeId}`;
    this.subscription = this.http.getData(url).subscribe({
      next: (res: any) => {
        this.teamLeaveSummaryCount = res.length;
        this.updateStatusTabs();
      },
      error: (err) => {
        this.teamLeaveSummaryCount = 0;
        this.updateStatusTabs();
      },
    });
  }

  private updateStatusTabs() {
    this.statusTabs = [
      {
        label: 'Waiting For Approval',
        link: '/time-off/leaves/waiting-for-approval',
        count: this.waitingForApprovalCount,
        permission: {
          feature: 'Waiting For Approval (Time Off)',
          action: 'view',
        },
        icon: '/time-off-icon/waiting-for-approval-icon.png',
      },
      {
        label: 'Approved',
        link: '/time-off/leaves/approved',
        count: this.approvedCount,
        permission: { feature: 'Approved (Time Off)', action: 'view' },
        icon: '/time-off-icon/approved-icon.png',
      },
      {
        label: 'Processed',
        link: '/time-off/leaves/processed',
        count: this.processedCount,
        permission: { feature: 'Processed (Time Off)', action: 'view' },
        icon: '/time-off-icon/processed-icon.png',
      },
      {
        label: 'Rejected',
        link: '/time-off/leaves/rejected',
        count: this.rejectedCount,
        permission: { feature: 'Rejected (Time Off)', action: 'view' },
        icon: '/time-off-icon/rejected-icon.png',
      },
      {
        label: 'Cancelled',
        link: '/time-off/leaves/cancelled', count: this.cancelCount,
        permission: { feature: 'Cancelled (Time Off)', action: 'view' },
        icon: '/time-off-icon/cancelled-icon.png',
      },
      {
        label: 'Team Leave balance',
        link: '/time-off/leaves/team-leave-balance',
        count: this.teamLeaveBalanceCount,
        permission: { feature: 'Team Leave Balance (Time Off)', action: 'view' },
        icon: '/time-off-icon/team-leave-balance-icon.png',
      },
      {
        label: 'Team Leave Summary',
        link: '/time-off/leaves/team-leave-summary',
        count: this.teamLeaveSummaryCount,
        permission: { feature: 'Team Leave Balance Summary (Time Off)', action: 'view' },
        icon: '/time-off-icon/team-leave-summary-icon.png',
      },
      {
        label: 'Org Leave Balance',
        link: '/time-off/leaves/org-leave-balance',
        permission: { feature: 'Org Leave Balance', action: 'view' },
        icon: '/time-off-icon/Org-Leave-Balance-icon.png',
      },
    ];
    this.statusTabs = this.statusTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}