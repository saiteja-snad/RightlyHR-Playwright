import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';

@Component({
  selector: 'app-itsupport-compoment-tabs',
  imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './itsupport-compoment-tabs.component.html',
  styleUrl: './itsupport-compoment-tabs.component.scss'
})
export class ItsupportCompomentTabsComponent {
  closedTicketCount: number = 0;
  AllCount: number = 0;
  openTicketCount: number = 0;
  rejectedTicketCount: number = 0;
  awaitingOnUserTicketCount: number = 0;
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  ticketsClosed: any = [];
  ticketsRejected: any = [];
  ticketsOpen: any = [];
  ticketsAwaitOnUser:any = [];


  navTabs: any[] = [
    { label: 'All Tickets', link: '/it-support/team-tickets/all-tickets', count: 0 },
    { label: 'Open Tickets', link: '/it-support/team-tickets/open-tickets', count: 0 },
    { label: 'Await On User Tickets', link: '/it-support/team-tickets/await-on-user-tickets', count: 0 },
    { label: 'Solved Tickets', link: '/it-support/team-tickets/solved-tickets', count: 0 },
    { label: 'Rejected Tickets', link: '/it-support/team-tickets/rejected-tickets', count: 0 },

  ];

  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getuserticketsbyempid();
  }

  getuserticketsbyempid() {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getTicketsByReportingId/${EmpId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.ticketsClosed = data.filter((ticket: any) => ticket.ticketStatus === 'Closed')
        this.closedTicketCount = this.ticketsClosed.length;
        this.ticketsOpen = data.filter((ticket: any) => ticket.ticketStatus === 'Open')
        this.openTicketCount = this.ticketsOpen.length;
        this.ticketsAwaitOnUser = data.filter((ticket: any) => ticket.ticketStatus === 'Await On User')
        this.awaitingOnUserTicketCount = this.ticketsAwaitOnUser.length;
        this.ticketsRejected = data.filter((ticket: any) => ticket.ticketStatus === 'Rejected')
        this.rejectedTicketCount = this.ticketsRejected.length;
        this.AllCount = this.ticketsClosed.length + this.ticketsOpen.length + this.rejectedTicketCount + this.awaitingOnUserTicketCount;

        this.navTabs = [
          { label: 'All Tickets', link: '/it-support/team-tickets/all-tickets', count: this.AllCount },
          { label: 'Open Tickets', link: '/it-support/team-tickets/open-tickets', count: this.openTicketCount },
          { label: 'Await On User Tickets', link: '/it-support/team-tickets/await-on-user-tickets', count: this.awaitingOnUserTicketCount },
          { label: 'Solved Tickets', link: '/it-support/team-tickets/solved-tickets', count: this.closedTicketCount },
          { label: 'Rejected Tickets', link: '/it-support/team-tickets/rejected-tickets', count: this.rejectedTicketCount }
        ];
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }
}
