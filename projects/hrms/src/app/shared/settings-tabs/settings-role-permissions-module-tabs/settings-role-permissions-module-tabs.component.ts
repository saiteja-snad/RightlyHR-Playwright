import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-settings-role-permissions-module-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-role-permissions-module-tabs.component.html',
  styleUrl: './settings-role-permissions-module-tabs.component.scss'
})

export class SettingsRolePermissionsModuleTabsComponent {
  navTabs = [
    {
      label: 'Roles',
      link: '/settings/roles-permissions/roles',
      icon: '/settings-icon/role-assignee-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_ROLES_MODULE_INFO,
    },
    {
      label: 'Permissions',
      link: '/settings/roles-permissions/permissions',
      icon: '/settings-icon/permissions-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_ROLES_PERMISSION_MODULE_INFO,
    },
    {
      label: 'Assignee',
      link: '/settings/roles-permissions/role-assignee',
      icon: '/settings-icon/role-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_ROLES_ASSIGNEE_MODULE_INFO,
    }
  ];
}