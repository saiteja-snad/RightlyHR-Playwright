import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-leaves-approvaltabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './leaves-approvaltabs.component.html',
  styleUrl: './leaves-approvaltabs.component.scss'
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
  teamLeaveBalanceCount: number = 0;
  teamLeaveSummaryCount: number = 0;

  statusTabs: any[] = [
    { label: 'Waiting For Approval', link: 'waiting-for-approval',permission: {
        feature: 'Waiting For Approval (Time Off)',
        action: 'view',
      }, },
    { label: 'Approved', link: 'approved', permission: { feature: 'Approved (Time Off)', action: 'view' },},
    { label: 'Processed', link: 'processed',permission: { feature: 'Processed (Time Off)', action: 'view' }, },
    { label: 'Rejected', link: 'rejected', permission: { feature: 'Rejected (Time Off)', action: 'view' },},
    { label: 'Cancelled', link: 'cancelled', permission: { feature: 'Cancelled(Time Off)', action: 'view' },},
    { label: 'Team Leave balance', link: 'team-leave-balance'},
    { label: 'Team Leave Summary', link: 'team-leave-summary'}
  ];

  constructor(public readonly router: Router, private http: HttpService, private authService: AuthService) { }

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

          this.waitingForApprovalCount = waiting.length;
          this.approvedCount = approved.length;
          this.rejectedCount = rejected.length;
          this.processedCount = processed.length;

          this.updateStatusTabs();
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
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
      }
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
      }
    });
  }

  private updateStatusTabs() {
    this.statusTabs = [
      { label: 'Waiting For Approval', link: '/time-off/leaves/waiting-for-approval', count: this.waitingForApprovalCount },
      { label: 'Approved', link: '/time-off/leaves/approved', count: this.approvedCount },
      { label: 'Processed', link: '/time-off/leaves/processed', count: this.processedCount },
      { label: 'Rejected', link: '/time-off/leaves/rejected', count: this.rejectedCount },
      { label: 'Cancelled', link: '/time-off/leaves/cancelled' },
      { label: 'Team Leave balance', link: '/time-off/leaves/team-leave-balance', count: this.teamLeaveBalanceCount },
      { label: 'Team Leave Summary', link: '/time-off/leaves/team-leave-summary', count: this.teamLeaveSummaryCount }
    ];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}