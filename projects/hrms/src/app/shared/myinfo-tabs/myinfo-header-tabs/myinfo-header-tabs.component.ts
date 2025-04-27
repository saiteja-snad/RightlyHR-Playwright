import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-myinfo-header-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './myinfo-header-tabs.component.html',
  styleUrl: './myinfo-header-tabs.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class MyinfoHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'Personal', link: '/myinfo/personal'},
    { label: 'Job', link: '/myinfo/job'},
    { label: 'Documents', link: '/myinfo/documents'},
    { label: 'Team Members', link: '/myinfo/team-members',permission: { feature: 'Team Members', action: 'view' } },
    { label: 'Onboard Request', link: '/myinfo/onboarding-request',permission: { feature: 'Onboard Request', action: 'view' } }
  ];
}
