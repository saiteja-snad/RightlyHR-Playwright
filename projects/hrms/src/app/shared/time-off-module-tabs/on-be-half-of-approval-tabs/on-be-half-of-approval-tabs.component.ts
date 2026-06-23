import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { CancelledComponent } from '../../../time-off/leaves/cancelled/cancelled.component';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-on-be-half-of-approval-tabs',
  imports: [
    CommonModule,
    RouterModule,
    TabsModule,
    SidetabsloadersComponent,
    DragDropModule,
    TabsDndDirective,
  ],
  templateUrl: './on-be-half-of-approval-tabs.component.html',
  styleUrl: './on-be-half-of-approval-tabs.component.scss',
})

export class OnBeHalfOfApprovalTabsComponent implements OnInit{
  readonly tabsKey = 'on-behalf-of-approval-timeoff-tabs';
  private readonly baseUrl = '/on-behalf-of/on-behalf-of';
  loggedinuser = {} as any;
  empdata = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  cadidateEmployeeId!: number;
  processedCount: any;
  waitingForApprovalCount: any;
  approvedCount: any;
  rejectedCount: any;
  cancelledCount: any;
  loading = false;
  private readonly allTabs: Array<
    Omit<StatusTab, 'count'> & { countKey: string }
  > = [
    {
      tabId: '/on-behalf-of/on-behalf-of/waiting-for-approval',
      label: 'Waiting For Approval',
      link: '/on-behalf-of/on-behalf-of/waiting-for-approval',
      icon: '/time-off-icon/waiting-for-approval-icon.png',
      permission: {
        feature: 'Waiting For Approval (On Behalf Of)',
        action: 'view',
      },
      countKey: 'waiting',
    },
    {
      tabId: '/on-behalf-of/on-behalf-of/approved',
      label: 'Approved',
      link: '/on-behalf-of/on-behalf-of/approved',
      icon: '/time-off-icon/approved-icon.png',
      permission: { feature: 'Approved (On Behalf Of)', action: 'view' },
      countKey: 'approved',
    },
    {
      tabId: '/on-behalf-of/on-behalf-of/processed',
      label: 'Processed',
      link: '/on-behalf-of/on-behalf-of/processed',
      icon: '/time-off-icon/processed-icon.png',
      permission: { feature: 'Processed (On Behalf Of)', action: 'view' },
      countKey: 'processed',
    },
    {
      tabId: '/on-behalf-of/on-behalf-of/rejected',
      label: 'Rejected',
      link: '/on-behalf-of/on-behalf-of/rejected',
      icon: '/time-off-icon/rejected-icon.png',
      permission: { feature: 'Rejected (On Behalf Of)', action: 'view' },
      countKey: 'rejected',
    },
    {
      tabId: '/on-behalf-of/on-behalf-of/cancel',
      label: 'Cancelled',
      link: '/on-behalf-of/on-behalf-of/cancel',
      icon: '/time-off-icon/cancelled-icon.png',
      permission: { feature: 'Cancelled (On Behalf Of)', action: 'view' },
      countKey: 'cancelled',
    },
  ];
  tabs: StatusTab[] = [];

  constructor(
    public readonly router: Router,
    private http: HttpService,
    private authService: AuthService,
    private rbac: RbacService,
    private timeoffYearFilterService: TimeoffYearFilterService,
    private menuOrderService: MenuOrderService,
  ) {
    // Signal reaction for employee switch or year change
    effect(() => {
      if (this.http.onBehalfOfTriggerSignal() > 0) {
        this.cadidateEmployeeId = parseInt(
          localStorage.getItem('onbehalfof') as string,
        );
        if (!isNaN(this.cadidateEmployeeId)) {
          this.getDataByLPID();
        } else {
          this.rebuildTabs({
            waiting: 0,
            approved: 0,
            processed: 0,
            rejected: 0,
            cancelled: 0,
          });
        }
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  async ngOnInit(): Promise<void> {
    this.loggedinuser = this.authService.getToken();
    await this.menuOrderService.ensureLoaded();
    this.rebuildTabs({
      waiting: 0,
      approved: 0,
      processed: 0,
      rejected: 0,
      cancelled: 0,
      entitlement: 0,
    });
  }

  private rebuildTabs(counts: Record<string, number>): void {
    this.loading = true;
    const filtered = this.allTabs
      .filter((tab) => {
        if (!tab.permission) return true;
        const { feature, action } = tab.permission;
        return this.rbac.allowedToAccess(`${feature}.${action}`);
      })
      .map((tab) => ({
        tabId: tab.tabId,
        label: tab.label,
        link: tab.link,
        icon: tab.icon,
        permission: tab.permission,
        count: counts[tab.countKey] ?? 0,
      }));

    this.tabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      filtered,
      (t) => t.tabId,
    );
    this.loading = false;

    const currentUrl = this.router.url.split('?')[0];
    const baseUrl = this.baseUrl;
    if (currentUrl === baseUrl && this.tabs.length > 0) {
      this.router.navigateByUrl(this.tabs[0].link);
    }
    const isAllowed = this.tabs.some((tab) => tab.link === currentUrl);
    if (
      !isAllowed &&
      this.tabs.length > 0 &&
      currentUrl.startsWith(baseUrl)
    ) {
      this.router.navigateByUrl(this.tabs[0].link);
    }
  }


  getDataByLPID() {
    this.loading=true
    const selectedYear = this.timeoffYearFilterService.getSelectedYear();
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}?year=${selectedYear}`).subscribe({
      next: (response: any) => {
        this.loading=false
        if (Array.isArray(response)) {
          // Count based on status
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          const Cancelled = response.filter(item => item.status === 'Cancelled');
          const entitlement = response.filter(item => item.status === 'Entitlement Summary');
          // Set counts
          this.rebuildTabs({
              waiting: waiting.length,
              approved: approved.length,
              processed: processed.length,
              rejected: rejected.length,
              cancelled: Cancelled.length,
              entitlement: entitlement.length,
            });
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) =>{
         console.log(reason)
         this.loading=false
      }
    });
  }

  trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }
}
