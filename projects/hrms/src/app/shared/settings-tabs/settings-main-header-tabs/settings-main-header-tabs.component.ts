import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-main-header-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-main-header-tabs.component.html',
  styleUrl: './settings-main-header-tabs.component.scss',
})
export class SettingsMainHeaderTabsComponent implements OnInit {
  public navTabs: any[] = [];

  private allNavTabs = [
    { label: 'Employee Fields', link: '/settings/employee-fields', permission: { feature: 'Employee Fields Module', action: 'view' } },
    { label: 'Roles', link: '/settings/roles-permissions' },
    { label: 'Time Off', link: '/settings/timeoff-configurations', permission: { feature: 'Settings Timeoff Module', action: 'view' } },
    { label: 'Asset Configuration', link: '/settings/assets-configuration', permission: { feature: 'Assets Management Configuration Module', action: 'view' } },
    { label: 'Dynamic Forms', link: '/settings/dynamic-forms', permission: { feature: 'Dynamic Forms Module', action: 'view' } }
  ];

  constructor(public rbac: RbacService, private router: Router) {}

  ngOnInit(): void {
    // Filter tabs based on permissions
    this.navTabs = this.allNavTabs.filter(tab => {
      if (!tab.permission) return true;
      return this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`);
    });

    // const currentUrl = this.router.url;
    // const baseUrl = '/settings';

    // // If at base URL, navigate to the first accessible tab
    // if (currentUrl === baseUrl && this.navTabs.length > 0) {
    //   this.router.navigateByUrl(this.navTabs[0].link);
    //   return;
    // }

    // // If current route is not one of the accessible links, redirect
    // const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
    // if (!isAllowed && this.navTabs.length > 0) {
    //   this.router.navigateByUrl(this.navTabs[0].link);
    // }
  }
}