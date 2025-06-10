import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Ipersonal } from '../../Interfaces/members-model';
import { RbacService } from '../../services/rbac.service';
import { SidetabsloadersComponent } from "../sidetabsloaders/sidetabsloaders.component";
@Component({
  selector: 'app-itsupport-compoment-tabs',
  imports: [CommonModule, TabsModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './itsupport-compoment-tabs.component.html',
  styleUrl: './itsupport-compoment-tabs.component.scss'
})

export class ItsupportCompomentTabsComponent implements OnInit, OnDestroy {
  closedTicketCount: number = 0;
  AllCount: number = 0;
  openTicketCount: number = 0;
  rejectedTicketCount: number = 0;
  awaitingOnUserTicketCount: number = 0;
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  ticketsClosed: any[] = [];
  ticketsRejected: any[] = [];
  ticketsOpen: any[] = [];
  ticketsAwaitOnUser: any[] = [];
  navTabs: any[] = [];
  loading=false
  defaultRoute: string = '';
  // Original unfiltered tab structure with permissions
  private allTabs = [
    { label: 'All Tickets', link: '/it-support/team-tickets/all-tickets', countKey: 'AllCount', icon: '/desk-icon/all-icon.png', permission: { feature: 'All Tickets Tab', action: 'view' } },
    { label: 'Open Tickets', link: '/it-support/team-tickets/open-tickets', countKey: 'openTicketCount', icon: '/it-support-icons/open-icon.png', permission: { feature: 'Open Tickets Tab', action: 'view' } },
    { label: 'Await On User Tickets', link: '/it-support/team-tickets/await-on-user-tickets', countKey: 'awaitingOnUserTicketCount', icon: '/it-support-icons/Await-icon.png', permission: { feature: 'Await On User Tickets Tab', action: 'view' } },
    { label: 'Closed Tickets', link: '/it-support/team-tickets/solved-tickets', countKey: 'closedTicketCount', icon: '/it-support-icons/solved-icon.png', permission: { feature: 'Solved Tickets Tab', action: 'view' } },
    { label: 'Rejected Tickets', link: '/it-support/team-tickets/rejected-tickets', countKey: 'rejectedTicketCount', icon: '/time-off-icon/rejected-icon.png', permission: { feature: 'Rejected Tickets Tab', action: 'view' } }
  ];

  constructor(
    private readonly http: HttpService,
    private rbac: RbacService,
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getuserticketsbyempid();
    this.http.refreshRequested$.subscribe(() => {
    this.getuserticketsbyempid();
  });
  }

  getuserticketsbyempid() {
    this.loading=true
    const EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getTicketsByReportingId/${EmpId}`).subscribe({
      next: (data: any) => {
        this.loading=false
        this.ticketsClosed = data.filter((ticket: any) => ticket.ticketStatus === 'Closed');
        this.closedTicketCount = this.ticketsClosed.length;
        this.ticketsOpen = data.filter((ticket: any) => ticket.ticketStatus === 'Open');
        this.openTicketCount = this.ticketsOpen.length;
        this.ticketsAwaitOnUser = data.filter((ticket: any) => ticket.ticketStatus === 'Await On User');
        this.awaitingOnUserTicketCount = this.ticketsAwaitOnUser.length;
        this.ticketsRejected = data.filter((ticket: any) => ticket.ticketStatus === 'Rejected');
        this.rejectedTicketCount = this.ticketsRejected.length;
        this.AllCount = this.closedTicketCount + this.openTicketCount + this.rejectedTicketCount + this.awaitingOnUserTicketCount;
        // Now filter based on permission and assign ticket counts
        this.navTabs = this.allTabs
          .filter(tab =>
            tab.permission &&
            this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
          )
          .map(tab => ({
            ...tab,
            count: this[tab.countKey as keyof this]
          }));

        if (this.navTabs.length > 0) {
          this.defaultRoute = this.navTabs[0].link;
        }
      
        // const currentUrl = this.router.url;
        // const baseUrl = '/it-support/team-tickets';
        // if (currentUrl === baseUrl && this.defaultRoute) {
        //   this.router.navigateByUrl(this.defaultRoute);
        // }
        // const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
        // if (!isAllowed && this.defaultRoute) {
        //   this.router.navigateByUrl(this.defaultRoute);
        // }
      },
      
      error: (err: any) => {
        console.error(err);
        this.loading=false
      }
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}