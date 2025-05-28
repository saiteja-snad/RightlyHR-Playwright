import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { SettingsPersonalTabsComponent } from "../../../shared/settings-tabs/settings-personal-tabs/settings-personal-tabs.component";
import { SettingsJobTabsComponent } from "../../../shared/settings-tabs/settings-job-tabs/settings-job-tabs.component";
import { SettingsExpenesConfigurtionsTabsComponent } from "../../../shared/settings-expenes-configurtions-tabs/settings-expenes-configurtions-tabs.component";
import { ManageWeekendsTabsComponent } from "../../../shared/settings-tabs/manage-weekends-tabs/manage-weekends-tabs.component";
import { ManageDstTabsComponent } from "../../../shared/settings-tabs/manage-dst-tabs/manage-dst-tabs.component";
import { SettingsManageShitsTabsComponent } from "../../../shared/settings-tabs/settings-manage-shits-tabs/settings-manage-shits-tabs.component";
import { SettingsManageHolidaysTabsComponent } from "../../../shared/settings-tabs/settings-manage-holidays-tabs/settings-manage-holidays-tabs.component";
import { SettingsManagePoliciesTabsComponent } from "../../../shared/settings-tabs/settings-manage-policies-tabs/settings-manage-policies-tabs.component";
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { filter } from 'rxjs';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-employee-fields-layout',
  imports: [CommonModule, RouterModule, SettingsEmployeeFieldsModuleTabsComponent, SettingsPersonalTabsComponent, SettingsJobTabsComponent,
    SettingsExpenesConfigurtionsTabsComponent, ManageWeekendsTabsComponent, ManageDstTabsComponent, SettingsManageShitsTabsComponent,
    SettingsManageHolidaysTabsComponent, SettingsManagePoliciesTabsComponent, ModuleInformationComponent,NgbPopoverModule],
  templateUrl: './employee-fields-layout.component.html',
  styleUrl: './employee-fields-layout.component.scss'
})

export class EmployeeFieldsLayoutComponent implements OnInit{
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
      '/settings/employee-fields/addholidays',
      '/settings/employee-fields/updateholidays',
      '/settings/employee-fields/viewholidays',
      '/settings/employee-fields/cloneholidays',
      '/settings/employee-fields/addshifts',
      /^\/settings\/employee-fields\/updateshifts\/\d+$/,
      /^\/settings\/employee-fields\/cloneshifts\/\d+$/,
      /^\/settings\/employee-fields\/viewshifts\/\d+$/,
      '/settings/employee-fields/addpolices',
      '/settings/employee-fields/updatepolices',
      '/settings/employee-fields/viewpolices',
      '/settings/employee-fields/add-weekends',
      '/settings/employee-fields/update-weekends',
      '/settings/employee-fields/clone-weekends',
      '/settings/employee-fields/view-weekends',
      '/settings/employee-fields/add-dst',
      '/settings/employee-fields/update-dst',
      '/settings/employee-fields/clone-dst',
      '/settings/employee-fields/view-dst',
      '/settings/employee-fields/updateholidays',
      '/settings/employee-fields/viewholidays',
      '/settings/employee-fields/updatepolices',
      `/settings/employee-fields/clonepolices`,
      '/settings/employee-fields/viewpolices',
      '/settings/employee-fields/documents',
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
      '/settings/employee-fields/personal': MODULE_INFOS.SETTINGS_PERSONAL_INFO_MODULE_INFO,
      '/settings/employee-fields/job': MODULE_INFOS.SETTINGS_JOB_INFO_MODULE_INFO,
      '/settings/employee-fields/documents': MODULE_INFOS.SETTINGS_DOCUMENTS_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-shifts': MODULE_INFOS.SETTINGS_MANAGE_SHIFTS_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-policies': MODULE_INFOS.SETTINGS_MANAGE_POLICIES_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-holidays': MODULE_INFOS.SETTINGS_MANAGE_HOLIDAYS_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-weekends': MODULE_INFOS.SETTINGS_MANAGE_WEEKENDS_INFO_MODULE_INFO,
      '/settings/employee-fields/expenes': MODULE_INFOS.SETTINGS_ESPENSE_TYPE_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-dsts': MODULE_INFOS.SETTINGS_MANAGE_DST_INFO_MODULE_INFO,
      '/settings/employee-fields/no-due-clearnce': MODULE_INFOS.SETTINGS_NO_DUE_CLEARANCE_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}