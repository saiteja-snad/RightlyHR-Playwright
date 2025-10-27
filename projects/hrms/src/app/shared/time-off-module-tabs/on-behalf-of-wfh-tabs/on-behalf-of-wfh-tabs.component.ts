import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';

@Component({
  selector: 'app-on-behalf-of-wfh-tabs',
  imports: [RouterModule, CommonModule, TabsModule, SidetabsloadersComponent],
  templateUrl: './on-behalf-of-wfh-tabs.component.html',
  styleUrl: './on-behalf-of-wfh-tabs.component.scss'
})

export class OnBehalfOfWfhTabsComponent implements OnInit, OnDestroy {
  filteredTabs: any[] = [];
  loading = false
  rejectedWFHRequestsCount = 0;
  waitingForApprovalWFHCount = 0;
  approvedWFHRequestsCount = 0;
  processedWFHRequestsCount = 0;
  cancelWFHRequestsCount = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();

  navTabs: any[] = [
    {
      label: 'Waiting For Approval',
      link: 'waiting-for-approval',
      icon: '/time-off-icon/waiting-for-approval-icon.png',
      permission: { feature: 'Waiting For Approval (On Behalf Of WFH)', action: 'view' },
    },
    {
      label: 'Approved',
      link: 'approved',
      icon: '/time-off-icon/approved-icon.png',
      permission: { feature: 'Approved (On Behalf Of WFH)', action: 'view' },
    },
    {
      label: 'Processed',
      link: 'processed',
      icon: '/time-off-icon/processed-icon.png',
      permission: { feature: 'Processed (On Behalf Of WFH)', action: 'view' },
    },
    {
      label: 'Rejected',
      link: 'rejected',
      icon: '/time-off-icon/rejected-icon.png',
      permission: { feature: 'Rejected (On Behalf Of WFH)', action: 'view' },
    },
    {
      label: 'Cancelled',
      link: 'cancelled',
      icon: '/time-off-icon/cancelled-icon.png',
      permission: { feature: 'Cancelled (On Behalf Of WFH)', action: 'view' },
    },
  ];

  constructor(
    public readonly router: Router,
    private http: HttpService,
    public rbac: RbacService
  ) {
    effect(() => {
      if (this.http.onBehlafOfWFHSignal()) {
        this.http.onBehalfOfWFHSelectedEmp$.subscribe((emp: number) => {
          if (emp) {
            this.getWFHRequest(emp);
          } else {
            this.resetWFHCounts();
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  getWFHRequest(employeeId: number) {
    this.loading = true
    const selectedYear = new Date().getFullYear();
    this.http.getFilterOnBehalfWFHDataByID(employeeId, selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT', response);
        if (Array.isArray(response)) {
          const waiting = response.filter((item: { status: string; }) => item.status === 'Waiting for Approval');
          const approved = response.filter((item: { status: string; }) => item.status === 'Approved');
          const rejected = response.filter((item: { status: string; }) => item.status === 'Rejected');
          const processed = response.filter((item: { status: string; }) => item.status === 'Processed');
          const cancelled = response.filter((item: { status: string; }) => item.status === 'Cancelled');

          // Count Assign
          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          this.cancelWFHRequestsCount = cancelled.length
          this.updateNavTabs();
          this.loading = false
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => {
        this.loading = true;
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-ERROR', reason);
      }
    });
  }


  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: 'waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalWFHCount,
        permission: { feature: 'Waiting For Approval (On Behalf Of WFH)', action: 'view' },
      },
      {
        label: 'Approved',
        link: 'approved',
        icon: '/time-off-icon/approved-icon.png',
        count: this.approvedWFHRequestsCount,
        permission: { feature: 'Approved (On Behalf Of WFH)', action: 'view' },
      },
      {
        label: 'Processed',
        link: 'processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processedWFHRequestsCount,
        permission: { feature: 'Processed (On Behalf Of WFH)', action: 'view' },
      },
      {
        label: 'Rejected',
        link: 'rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedWFHRequestsCount,
        permission: { feature: 'Rejected (On Behalf Of WFH)', action: 'view' },
      },
      {
        label: 'Cancelled',
        link: 'cancelled',
        icon: '/time-off-icon/cancelled-icon.png',
        count: this.cancelWFHRequestsCount,
        permission: { feature: 'Cancelled (On Behalf Of WFH)', action: 'view' },
      },
    ];
    this.filterTabsByRbac();
  }

  resetWFHCounts(): void {
    this.waitingForApprovalWFHCount = 0;
    this.approvedWFHRequestsCount = 0;
    this.rejectedWFHRequestsCount = 0;
    this.processedWFHRequestsCount = 0;
    this.cancelWFHRequestsCount = 0;
    this.loading = false;
    this.updateNavTabs();
  }

  ngOnDestroy(): void {
    this.http.onBehalfOfWFHSelectedEmp$.next(null);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}