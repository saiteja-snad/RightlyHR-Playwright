import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-team-member-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './team-member-tabs.component.html',
  styleUrl: './team-member-tabs.component.scss'
})
export class TeamMemberTabsComponent {
  navTabs: any[] = [
     { label: 'Reporting Manager Change', link: '/myinfo/team/team-members',permission: { feature: 'My Info Reporting Managers Tab', action: 'view' }},
 //   { label: 'Team Manager Change', link: '/myinfo/team/team-manger-members',permission: { feature: 'My Info Team Managers Tab', action: 'view' }},
  
   
  ];
}
