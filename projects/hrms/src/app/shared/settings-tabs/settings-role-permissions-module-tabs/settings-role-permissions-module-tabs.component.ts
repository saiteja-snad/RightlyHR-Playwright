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

  navTabs = [
    { label: 'Roles',link: '/settings/roles-permissions/roles'},
    { label: 'Permissions',link: '/settings/roles-permissions/permissions'},
    { label: 'Assignee',link: '/settings/roles-permissions/role-assignee'}
  ];
}