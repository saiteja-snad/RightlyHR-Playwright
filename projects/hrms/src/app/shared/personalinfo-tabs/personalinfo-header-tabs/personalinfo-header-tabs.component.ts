import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-personalinfo-header-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './personalinfo-header-tabs.component.html',
  styleUrl: './personalinfo-header-tabs.component.scss'
})
export class PersonalinfoHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'Personal', link: '/personalinfo/personal'},
    { label: 'Job', link: '/personalinfo/job'},
    { label: 'Documents', link: '/personalinfo/documents'},
    { label: 'Team Members', link: '/personalinfo/team-members',permission: { feature: 'Team Members', action: 'view' } },
   
  ];
}
