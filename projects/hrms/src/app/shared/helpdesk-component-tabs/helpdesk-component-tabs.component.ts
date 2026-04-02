import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Ipersonal } from '../../Interfaces/members-model';
import { RbacService } from '../../services/rbac.service';
import { SidetabsloadersComponent } from '../sidetabsloaders/sidetabsloaders.component';

@Component({
  selector: 'app-helpdesk-component-tabs',
  imports: [CommonModule, TabsModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './helpdesk-component-tabs.component.html',
  styleUrl: './helpdesk-component-tabs.component.scss',
})
export class HelpdeskComponentTabsComponent implements OnInit {
  closedTicketCount: number = 0;
  AllCount: number = 0;
  openTicketCount: number = 0;
  rejectedTicketCount: number = 0;
  inprogressOnUserTicketCount: number = 0;
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  ticketsClosed: any[] = [];
  ticketsRejected: any[] = [];
  ticketsOpen: any[] = [];
  ticketsAwaitOnUser: any[] = [];
  navTabs: any[] = [];
  loading = false;
  defaultRoute: string = '';
  // Original unfiltered tab structure with permissions
  private allTabs = [
    {
      label: 'All',
      link: '/help-desk/support-desk/all-tickets',
      countKey: 'AllCount',
      icon: '/desk-icon/all-icon.png',
      permission: { feature: 'Helpdesk All Queries Tab', action: 'view' },
    },
    {
      label: 'Open',
      link: '/help-desk/support-desk/open-tickets',
      countKey: 'openTicketCount',
      icon: '/it-support-icons/open-icon.png',
      permission: { feature: 'Helpdesk Open Queries Tab', action: 'view' },
    },
    {
      label: 'Await On User',
      link: '/help-desk/support-desk/await-on-user-tickets',
      countKey: 'inprogressOnUserTicketCount',
      icon: '/it-support-icons/Await-icon.png',
      permission: {
        feature: 'Helpdesk Await On User Queries Tab',
        action: 'view',
      },
    },
    {
      label: 'Closed',
      link: '/help-desk/support-desk/solved-tickets',
      countKey: 'closedTicketCount',
      icon: '/it-support-icons/solved-icon.png',
      permission: { feature: 'Helpdesk Solved Queries Tab', action: 'view' },
    },
    {
      label: 'Rejected',
      link: '/help-desk/support-desk/rejected-tickets',
      countKey: 'rejectedTicketCount',
      icon: '/time-off-icon/rejected-icon.png',
      permission: { feature: 'Helpdesk Rejected Queries Tab', action: 'view' },
    },
  ];

  constructor(
    private readonly http: HttpService,
    private rbac: RbacService,
  ) {}

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    // ✅ Subscribe to BehaviorSubject
    this.subscription = this.http.ticketCount$.subscribe((res: any) => {
      if (res) {
        this.processCountResponse(res);
      }
    });

    // ✅ Initial load
    this.http.refreshTicketCounts();
  }
  processCountResponse(res: any) {
    this.loading = false;
    const responseData = res.data || [];

    // Reset counts
    this.closedTicketCount = 0;
    this.openTicketCount = 0;
    this.inprogressOnUserTicketCount = 0;
    this.rejectedTicketCount = 0;

    responseData.forEach((item: any) => {
      const status = item.status?.toLowerCase();

      if (status === 'closed') {
        this.closedTicketCount = item.totalCount;
      } else if (status === 'open') {
        this.openTicketCount = item.totalCount;
      } else if (status === 'await on user') {
        this.inprogressOnUserTicketCount = item.totalCount;
      } else if (status === 'rejected') {
        this.rejectedTicketCount = item.totalCount;
      }
    });

    this.AllCount =
      this.closedTicketCount +
      this.openTicketCount +
      this.rejectedTicketCount +
      this.inprogressOnUserTicketCount;

    // Permission-based tabs
    this.navTabs = this.allTabs
      .filter(
        (tab) =>
          tab.permission &&
          this.rbac.allowedToAccess(
            `${tab.permission.feature}.${tab.permission.action}`,
          ),
      )
      .map((tab) => ({
        ...tab,
        count: this[tab.countKey as keyof this],
      }));

    if (this.navTabs.length > 0) {
      this.defaultRoute = this.navTabs[0].link;
    }
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
