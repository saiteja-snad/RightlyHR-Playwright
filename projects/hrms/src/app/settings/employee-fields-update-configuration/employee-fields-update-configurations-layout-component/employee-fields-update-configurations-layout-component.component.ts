import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsJobTabsComponent } from "../../../shared/settings-tabs/settings-job-tabs/settings-job-tabs.component";
import { SettingsExpenesConfigurtionsTabsComponent } from "../../../shared/settings-expenes-configurtions-tabs/settings-expenes-configurtions-tabs.component";
import { ManageWeekendsTabsComponent } from "../../../shared/settings-tabs/manage-weekends-tabs/manage-weekends-tabs.component";
import { ManageDstTabsComponent } from "../../../shared/settings-tabs/manage-dst-tabs/manage-dst-tabs.component";
import { SettingsManageShitsTabsComponent } from "../../../shared/settings-tabs/settings-manage-shits-tabs/settings-manage-shits-tabs.component";
import { SettingsManageHolidaysTabsComponent } from "../../../shared/settings-tabs/settings-manage-holidays-tabs/settings-manage-holidays-tabs.component";
import { SettingsManagePoliciesTabsComponent } from "../../../shared/settings-tabs/settings-manage-policies-tabs/settings-manage-policies-tabs.component";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { filter } from 'rxjs';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
import { PersonalFieldUpdateConfigComponent } from '../../../shared/field-update-configuraions/personal-field-update-config/personal-field-update-config.component';
import { JobFieldUpdateConfigComponent } from '../../../shared/field-update-configuraions/job-field-update-config/job-field-update-config.component';

@Component({
  selector: 'app-employee-fields-update-configurations-layout-component',
   imports: [CommonModule, RouterModule, PersonalFieldUpdateConfigComponent, SettingsJobTabsComponent,JobFieldUpdateConfigComponent,
    SettingsExpenesConfigurtionsTabsComponent, ManageWeekendsTabsComponent, ManageDstTabsComponent, SettingsManageShitsTabsComponent,
    SettingsManageHolidaysTabsComponent, SettingsManagePoliciesTabsComponent, NgbPopoverModule, SettingsHeaderComponent],
  templateUrl: './employee-fields-update-configurations-layout-component.component.html',
  styleUrl: './employee-fields-update-configurations-layout-component.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class EmployeeFieldsUpdateConfigurationsLayoutComponentComponent implements OnInit{
  moduleinfo : string = '';
  constructor(public readonly router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  shouldShowSection(): boolean {
    const cloningPolicyId = localStorage.getItem('cloningPolicyId');
    const excludedRoutes: (string | RegExp)[] = [
      '/settings/employee-fields-update-configurations/addholidays',
      '/settings/employee-fields-update-configurations/updateholidays',
      '/settings/employee-fields-update-configurations/viewholidays',
      '/settings/employee-fields-update-configurations/cloneholidays',
      '/settings/employee-fields-update-configurations/addshifts',
      /^\/settings\/employee-fields-update-configurations\/updateshifts\/\d+$/,
      /^\/settings\/employee-fields-update-configurations\/cloneshifts\/\d+$/,
      /^\/settings\/employee-fields-update-configurations\/viewshifts\/\d+$/,
      '/settings/employee-fields-update-configurations/addpolices',
      '/settings/employee-fields-update-configurations/updatepolices',
      '/settings/employee-fields-update-configurations/viewpolices',
      '/settings/employee-fields-update-configurations/add-weekends',
      '/settings/employee-fields-update-configurations/update-weekends',
      '/settings/employee-fields-update-configurations/clone-weekends',
      '/settings/employee-fields-update-configurations/view-weekends',
      '/settings/employee-fields-update-configurations/add-dst',
      '/settings/employee-fields-update-configurations/update-dst',
      '/settings/employee-fields-update-configurations/clone-dst',
      '/settings/employee-fields-update-configurations/view-dst',
      '/settings/employee-fields-update-configurations/updateholidays',
      '/settings/employee-fields-update-configurations/viewholidays',
      '/settings/employee-fields-update-configurations/updatepolices',
      `/settings/employee-fields-update-configurations/clonepolices`,
      '/settings/employee-fields-update-configurations/viewpolices',
      '/settings/employee-fields-update-configurations/documents',
    ];
    return !excludedRoutes.some((pattern) => {
      if (typeof pattern === 'string') {
        return pattern === this.router.url;
      } else if (pattern instanceof RegExp) {
        return pattern.test(this.router.url);
      }
      return false;
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/employee-fields-update-configurations/personal': MODULE_INFOS.SETTINGS_PERSONAL_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/job': MODULE_INFOS.SETTINGS_JOB_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/documents': MODULE_INFOS.SETTINGS_DOCUMENTS_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/manage-shifts': MODULE_INFOS.SETTINGS_MANAGE_SHIFTS_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/manage-policies': MODULE_INFOS.SETTINGS_MANAGE_POLICIES_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/manage-holidays': MODULE_INFOS.SETTINGS_MANAGE_HOLIDAYS_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/manage-weekends': MODULE_INFOS.SETTINGS_MANAGE_WEEKENDS_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/expenes': MODULE_INFOS.SETTINGS_ESPENSE_TYPE_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/manage-dsts': MODULE_INFOS.SETTINGS_MANAGE_DST_INFO_MODULE_INFO,
      '/settings/employee-fields-update-configurations/no-due-clearnce': MODULE_INFOS.SETTINGS_NO_DUE_CLEARANCE_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}
