import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-itsuporrt-header-tabs',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './itsuporrt-header-tabs.component.html',
  styleUrl: './itsuporrt-header-tabs.component.scss'
})
export class ItsuporrtHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'My Tickets', link: '/it-support/mytickets' },
    { label: 'Team Tickets', link: '/it-support/team-tickets' },
    
  ];
}
