import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

@Component({
  selector: 'app-on-behalf-of-remotelogin-tabs',
  imports: [RouterModule, CommonModule, TabsModule, SidetabsloadersComponent, DragDropModule, TabsDndDirective],
  templateUrl: './on-behalf-of-remotelogin-tabs.component.html',
  styleUrl: './on-behalf-of-remotelogin-tabs.component.scss'
})
export class OnBehalfOfRemoteloginTabsComponent implements OnInit, OnDestroy{
  readonly tabsKey = 'on-behalf-of-remotelogin-tabs';
  private readonly baseUrl = '/on-behalf-of/on-behalf-of-remotelogin';
  filteredTabs: any[] = [];
  loading = false
  rejectedRemoteLoginRequestsCount = 0;
  waitingForApprovalRemoteLoginCount = 0;
  approvedRemoteLoginRequestsCount = 0;
  processedRemoteLoginRequestsCount = 0;
  cancelRemoteLoginRequestsCount = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();

  navTabs: any[] = [
    {
      tabId: '/on-behalf-of/on-behalf-of-remotelogin/waiting-for-approval',
      label: 'Waiting For Approval',
      link: 'waiting-for-approval',
      icon: '/time-off-icon/waiting-for-approval-icon.png',
      permission: { feature: 'Waiting For Approval (On Behalf Of RemoteLogin)', action: 'view' },
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-remotelogin/approved',
      label: 'Approved',
      link: 'approved',
      icon: '/time-off-icon/approved-icon.png',
      permission: { feature: 'Approved (On Behalf Of RemoteLogin)', action: 'view' },
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-remotelogin/processed',
      label: 'Processed',
      link: 'processed',
      icon: '/time-off-icon/processed-icon.png',
      permission: { feature: 'Processed (On Behalf Of RemoteLogin)', action: 'view' },
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-remotelogin/rejected',
      label: 'Rejected',
      link: 'rejected',
      icon: '/time-off-icon/rejected-icon.png',
      permission: { feature: 'Rejected (On Behalf Of RemoteLogin)', action: 'view' },
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-remotelogin/cancelled',
      label: 'Cancelled',
      link: 'cancelled',
      icon: '/time-off-icon/cancelled-icon.png',
      permission: { feature: 'Cancelled (On Behalf Of RemoteLogin)', action: 'view' },
    },
  ];

  constructor(
    public readonly router: Router,
    private http: HttpService,
    public rbac: RbacService,
    private timeoffYearFilterService: TimeoffYearFilterService,
    private menuOrderService: MenuOrderService
  ) {
    effect(() => {
      if (this.http.onBehlafOfRemoteLoginSignal()) {
        const currentEmpId = this.http.onBehalfOfRemoteLoginSelectedEmp$.value;
        if (currentEmpId) {
          this.getRemoteLoginRequest(currentEmpId);
        } else {
          this.resetWFHCounts();
        }
        this.http.onBehlafOfRemoteLoginSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    void this.menuOrderService.ensureLoaded().then(() => {
      this.filterTabsByRbac();
    });
    
    this.http.onBehalfOfRemoteLoginSelectedEmp$.pipe(takeUntil(this.destroy$)).subscribe((emp: number) => {
      if (emp) {
        this.getRemoteLoginRequest(emp);
      } else {
        this.resetWFHCounts();
      }
    });

    // Listen for year changes
    this.timeoffYearFilterService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const currentEmpId = this.http.onBehalfOfRemoteLoginSelectedEmp$.value;
      if (currentEmpId) {
        this.getRemoteLoginRequest(currentEmpId);
      }
    });
  }

  getRemoteLoginRequest(employeeId: number) {
    this.loading = true;
    const selectedYear = this.timeoffYearFilterService.getSelectedYear();
    this.http.getFilterOnBehalfRemoteLoginDataByID(employeeId, selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('remote login data', response);
        if (Array.isArray(response)) {
          const waiting = response.filter((item: { status: string; }) => item.status === 'Waiting for Approval');
          const approved = response.filter((item: { status: string; }) => item.status === 'Approved');
          const rejected = response.filter((item: { status: string; }) => item.status === 'Rejected');
          const processed = response.filter((item: { status: string; }) => item.status === 'Processed');
          const cancelled = response.filter((item: { status: string; }) => item.status === 'Cancelled');

          // Count Assign
          this.waitingForApprovalRemoteLoginCount = waiting.length;
          this.approvedRemoteLoginRequestsCount = approved.length;
          this.rejectedRemoteLoginRequestsCount = rejected.length;
          this.processedRemoteLoginRequestsCount = processed.length;
          this.cancelRemoteLoginRequestsCount = cancelled.length;
          this.updateNavTabs();
          this.loading = false;
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => {
        this.loading = false;
        console.log('remote login data', reason);
      }
    });
  }


  filterTabsByRbac(): void {
    const filtered = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });

    this.filteredTabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      filtered,
      (t) => t.tabId
    );
    this.updateNavigation();
  }

  updateNavTabs() {
    this.navTabs = [
      {
        tabId: '/on-behalf-of/on-behalf-of-remotelogin/waiting-for-approval',
        label: 'Waiting For Approval',
        link: 'waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalRemoteLoginCount,
        permission: { feature: 'Waiting For Approval (On Behalf Of RemoteLogin)', action: 'view' },
      },
      {
        tabId: '/on-behalf-of/on-behalf-of-remotelogin/approved',
        label: 'Approved',
        link: 'approved',
        icon: '/time-off-icon/approved-icon.png',
        count: this.approvedRemoteLoginRequestsCount,
        permission: { feature: 'Approved (On Behalf Of RemoteLogin)', action: 'view' },
      },
      {
        tabId: '/on-behalf-of/on-behalf-of-remotelogin/processed',
        label: 'Processed',
        link: 'processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processedRemoteLoginRequestsCount,
        permission: { feature: 'Processed (On Behalf Of RemoteLogin)', action: 'view' },
      },
      {
        tabId: '/on-behalf-of/on-behalf-of-remotelogin/rejected',
        label: 'Rejected',
        link: 'rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedRemoteLoginRequestsCount,
        permission: { feature: 'Rejected (On Behalf Of RemoteLogin)', action: 'view' },
      },
      {
        tabId: '/on-behalf-of/on-behalf-of-remotelogin/cancelled',
        label: 'Cancelled',
        link: 'cancelled',
        icon: '/time-off-icon/cancelled-icon.png',
        count: this.cancelRemoteLoginRequestsCount,
        permission: { feature: 'Cancelled (On Behalf Of RemoteLogin)', action: 'view' },
      },
    ];
    this.filterTabsByRbac();
  }

  resetWFHCounts(): void {
    this.waitingForApprovalRemoteLoginCount = 0;
    this.approvedRemoteLoginRequestsCount = 0;
    this.rejectedRemoteLoginRequestsCount = 0;
    this.processedRemoteLoginRequestsCount = 0;
    this.cancelRemoteLoginRequestsCount = 0;
    this.loading = false;
    this.updateNavTabs();
  }

  trackByTabId(_: number, tab: any): string {
    return tab.tabId || tab.link;
  }

  private updateNavigation(): void {
    const baseUrl = this.baseUrl;
    const currentUrl = this.router.url.split('?')[0];
    const defaultRoute = this.filteredTabs.length > 0 ? `${this.baseUrl}/${this.filteredTabs[0].link}` : '';

    if ((currentUrl === baseUrl || currentUrl === `${baseUrl}/`) && defaultRoute) {
      this.router.navigateByUrl(defaultRoute);
      return;
    }

    const isAllowed = this.filteredTabs.some((tab) =>
      currentUrl === tab.tabId || currentUrl === tab.link || currentUrl.endsWith(`/${tab.link}`)
    );

    if (!isAllowed && currentUrl.startsWith(baseUrl) && defaultRoute) {
      this.router.navigateByUrl(defaultRoute);
    }
  }

  ngOnDestroy(): void {
    this.http.onBehalfOfRemoteLoginSelectedEmp$.next(null);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
