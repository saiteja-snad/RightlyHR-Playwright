import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-main-header-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-main-header-tabs.component.html',
  styleUrl: './settings-main-header-tabs.component.scss',
})
export class SettingsMainHeaderTabsComponent {
  public navTabs: any[] = [];

  constructor(public rbac: RbacService) {
    this.navTabs = this.allNavTabs.filter(tab =>{
      //inlcude all tha tabs which has the permission
      if (!tab.permission) {
        return true;
      }
      return tab.permission.feature &&
             tab.permission.action &&
             this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`);
  });
  }

  private allNavTabs = [
    { label: 'Employee Fields', link: '/settings/employee-fields', permission: { feature: 'Employee Fields Module', action: 'view' } },
    { label: 'Roles', link: '/settings/roles-permissions'},
    { label: 'Time Off', link: '/settings/timeoff-configurations', permission: { feature: 'Settings Timeoff Module', action: 'view' } },
    { label: 'Asset Configuration', link: '/settings/assets-configuration', permission: { feature: 'Assets Management configuration Module', action: 'view' } },
    { label: 'Dynamic Forms', link: '/settings/dynamic-forms', permission: { feature: 'Dynamic Forms Module', action: 'view' } }
  ];
}