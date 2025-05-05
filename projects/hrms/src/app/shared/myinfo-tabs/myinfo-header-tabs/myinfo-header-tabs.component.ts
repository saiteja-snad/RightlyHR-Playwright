import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-myinfo-header-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './myinfo-header-tabs.component.html',
  styleUrl: './myinfo-header-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MyinfoHeaderTabsComponent implements OnInit {
  navTabs: any[] = [
    { label: 'Personal', link: '/myinfo/personal',permission: { feature: 'My Info Personal', action: 'view' }, },
    { label: 'Job', link: '/myinfo/job',permission: { feature: 'My Info Job', action: 'view' }, },
    { label: 'Documents', link: '/myinfo/documents',permission: { feature: 'My Info Documents', action: 'view' }, },
    {
      label: 'Team Members',
      link: '/myinfo/team-members',
      permission: { feature: 'My Info Team Members', action: 'view' },
    },
    {
      label: 'Onboard Request',
      link: '/myinfo/onboarding-request',
      permission: { feature: 'My Info Onboard Request', action: 'view' },
    },
  ];

  constructor(private rbac: RbacService) {}

  ngOnInit(): void {
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
  }
}
