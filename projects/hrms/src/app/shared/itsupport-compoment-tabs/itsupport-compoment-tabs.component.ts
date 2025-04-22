import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-itsupport-compoment-tabs',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './itsupport-compoment-tabs.component.html',
  styleUrl: './itsupport-compoment-tabs.component.scss'
})
export class ItsupportCompomentTabsComponent {
  navTabs: any[] = [
    { label: 'All Tickets', link: '/it-support/team-tickets/all-tickets' },
    { label: 'Open Tickets', link: '/it-support/team-tickets/open-tickets' },
    { label: 'Solved Tickets', link: '/it-support/team-tickets/solved-tickets' }, 
    { label: 'Rejected Tickets', link: '/it-support/team-tickets/rejected-tickets' },
    
  ];
}
