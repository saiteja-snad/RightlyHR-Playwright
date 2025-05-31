import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-setting-dynamic-forms-tabs',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './setting-dynamic-forms-tabs.component.html',
  styleUrl: './setting-dynamic-forms-tabs.component.scss'
})

export class SettingDynamicFormsTabsComponent {
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
    {
      label: 'Active Forms',
      link: '/settings/dynamic-forms/active-forms',
      permission: { feature: 'Active Forms', action: 'view' },
      icon: '/settings-icon/vendor-details-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_ACTIVE_FORMS,
    },
    {
      label: 'Inactive Forms',
      link: '/settings/dynamic-forms/inactive-forms',
      permission: { feature: 'Inactive Forms', action: 'view' },
      icon: '/settings-icon/vendor-details-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_INACTIVE_FORMS,
    },
    {
      label: 'Draft Forms',
      link: '/settings/dynamic-forms/draft-forms',
      permission: { feature: 'Draft Forms', action: 'view' },
      icon: '/settings-icon/vendor-details-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_DRAFT_FORMS,
    },
    {
      label: 'Form Settings',
      link: '/settings/dynamic-forms/form-settings',
      permission: { feature: 'Form Settings', action: 'view' },
      icon: '/settings-icon/vendor-details-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_FORM_SETTINGS,
    }
  ];
}
