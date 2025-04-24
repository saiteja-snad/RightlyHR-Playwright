import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-settings-role-permissions-module-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './settings-role-permissions-module-tabs.component.html',
  styleUrl: './settings-role-permissions-module-tabs.component.scss'
})

export class SettingsRolePermissionsModuleTabsComponent {

  public navTabs: any[] = [];

  constructor(public rbac: RbacService) {
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  allTabs = [
    { label: 'Roles',link: '/settings/roles-permissions/roles',permission: { feature: 'Role Tab', action: 'view' } },
    { label: 'Permissions',link: '/settings/roles-permissions/permissions',permission: { feature: 'Role Permissions Tab', action: 'view' } },
    { label: 'Assignee',link: '/settings/roles-permissions/role-assignee',permission: { feature: 'Assignee Tab', action: 'view' } }
  ];
}