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
    { label: 'Personal', link: '/myinfo/personal' },
    { label: 'Job', link: '/myinfo/job' },
    { label: 'Team Members', link: '/myinfo/team-members' },
    { label: 'Onboard Request', link: '/myinfo/onboarding-request' }
  ];
}
