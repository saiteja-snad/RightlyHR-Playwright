import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MODULE_INFOS } from '../../shared/modules-info';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { SettingsRolePermissionsModuleTabsComponent } from "../../shared/settings-tabs/settings-role-permissions-module-tabs/settings-role-permissions-module-tabs.component";
import { SettingsTimeOffTabsComponent } from "../../shared/settings-tabs/settings-time-off-tabs/settings-time-off-tabs.component";
import { SettingsAssetsConfigurationsTabsComponent } from "../../shared/settings-tabs/settings-assets-configurations-tabs/settings-assets-configurations-tabs.component";
import { SettingDynamicFormsTabsComponent } from "../../shared/settings-tabs/setting-dynamic-forms-tabs/setting-dynamic-forms-tabs.component";
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-settings-overview',
  imports: [CommonModule, SettingsEmployeeFieldsModuleTabsComponent, SettingsRolePermissionsModuleTabsComponent, 
    SettingsTimeOffTabsComponent, SettingsAssetsConfigurationsTabsComponent, SettingDynamicFormsTabsComponent],
  templateUrl: './settings-overview.component.html',
  styleUrl: './settings-overview.component.scss'
})

export class SettingsOverviewComponent {
  settingEmployeefieldsModule = MODULE_INFOS.SETTINGS_EMPLOYEE_FIELDS_MODULE_INFO;
  settingRolesPermissionsModule = MODULE_INFOS.SETTINGS_ROLES_PERMISSIONS_MODULE_INFO;
  settingTimeOffModule = MODULE_INFOS.SETTINGS_TIME_OFF_MODULE_INFO;
  settingAssetsConfigurationModule = MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_MODULE_INFO;
  settingDynamicFormsModule = MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_MODULE_INFO;

  constructor(public rbac:RbacService){}
}