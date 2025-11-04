import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MODULE_INFOS } from '../../shared/modules-info';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { SettingsRolePermissionsModuleTabsComponent } from "../../shared/settings-tabs/settings-role-permissions-module-tabs/settings-role-permissions-module-tabs.component";
import { SettingsTimeOffTabsComponent } from "../../shared/settings-tabs/settings-time-off-tabs/settings-time-off-tabs.component";
import { SettingsAssetsConfigurationsTabsComponent } from "../../shared/settings-tabs/settings-assets-configurations-tabs/settings-assets-configurations-tabs.component";
import { SettingDynamicFormsTabsComponent } from "../../shared/settings-tabs/setting-dynamic-forms-tabs/setting-dynamic-forms-tabs.component";
import { RbacService } from '../../services/rbac.service';
import { PmsSettingsTabsComponent } from "../../shared/pms-module-tabs/pms-settings-tabs/pms-settings-tabs.component";
import { AccordionModule } from 'primeng/accordion';
import { Router } from '@angular/router';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { SettingsLockingSystemTabsComponent } from "../../shared/settings-tabs/settings-locking-system-tabs/settings-locking-system-tabs.component";
@Component({
  selector: 'app-settings-overview',
  imports: [CommonModule, SettingsEmployeeFieldsModuleTabsComponent, SettingsRolePermissionsModuleTabsComponent,
    SettingsTimeOffTabsComponent, SettingsAssetsConfigurationsTabsComponent, SettingDynamicFormsTabsComponent, PmsSettingsTabsComponent, AccordionModule, SettingsLockingSystemTabsComponent],
  templateUrl: './settings-overview.component.html',
  styleUrl: './settings-overview.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class SettingsOverviewComponent {
  settingEmployeefieldsModule = MODULE_INFOS.SETTINGS_EMPLOYEE_FIELDS_MODULE_INFO;
  settingRolesPermissionsModule = MODULE_INFOS.SETTINGS_ROLES_PERMISSIONS_MODULE_INFO;
  settingTimeOffModule = MODULE_INFOS.SETTINGS_TIME_OFF_MODULE_INFO;
  settingAssetsConfigurationModule = MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_MODULE_INFO;
  settingsPMSConfigurations = MODULE_INFOS.PMS_CONFIGURATION_MODULE_INFO;
  settingDynamicFormsModule = MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_MODULE_INFO;
  settingAttendanceConfigurationModule = MODULE_INFOS.SETTINGS_ATTENDANCE_CONFIGURATION_MODULE_INFO;
  settingLockingsystemnModule = MODULE_INFOS.SETTINGS_LOCKINGSYSTEM_MODULE_INFO;
  
  constructor(
    public rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) { }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }
}