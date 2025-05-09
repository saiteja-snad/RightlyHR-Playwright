import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-team-members-tabs',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './team-members-tabs.component.html',
  styleUrl: './team-members-tabs.component.scss'
})
export class TeamMembersTabsComponent {
  navTabs: any[] = [
    { label: 'Reporting Manager Change', link: '/personalinfo/team/team-members',permission: { feature: 'Team Members', action: 'view' }},
    // { label: 'Team Manager Change', link: '/personalinfo/team/team-manger-members',permission: { feature: 'Team Members', action: 'view' }},
  
   
  ];
}
