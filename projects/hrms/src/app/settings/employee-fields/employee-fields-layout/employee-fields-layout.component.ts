import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { SettingsPersonalTabsComponent } from "../../../shared/settings-tabs/settings-personal-tabs/settings-personal-tabs.component";
import { SettingsJobTabsComponent } from "../../../shared/settings-tabs/settings-job-tabs/settings-job-tabs.component";
import { SettingsExpenesConfigurtionsTabsComponent } from "../../../shared/settings-expenes-configurtions-tabs/settings-expenes-configurtions-tabs.component";
import { ManageWeekendsTabsComponent } from "../../../shared/settings-tabs/manage-weekends-tabs/manage-weekends-tabs.component";
import { ManageDstTabsComponent } from "../../../shared/settings-tabs/manage-dst-tabs/manage-dst-tabs.component";
import { SettingsManageShitsTabsComponent } from "../../../shared/settings-tabs/settings-manage-shits-tabs/settings-manage-shits-tabs.component";
import { SettingsManageHolidaysTabsComponent } from "../../../shared/settings-tabs/settings-manage-holidays-tabs/settings-manage-holidays-tabs.component";
import { SettingsManagePoliciesTabsComponent } from "../../../shared/settings-tabs/settings-manage-policies-tabs/settings-manage-policies-tabs.component";

@Component({
  selector: 'app-employee-fields-layout',
  imports: [CommonModule, RouterModule, SettingsEmployeeFieldsModuleTabsComponent, SettingsPersonalTabsComponent, SettingsJobTabsComponent, 
    SettingsExpenesConfigurtionsTabsComponent, ManageWeekendsTabsComponent, ManageDstTabsComponent, SettingsManageShitsTabsComponent, 
    SettingsManageHolidaysTabsComponent, SettingsManagePoliciesTabsComponent],
  templateUrl: './employee-fields-layout.component.html',
  styleUrl: './employee-fields-layout.component.scss'
})

export class EmployeeFieldsLayoutComponent {
  
  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  shouldShowSection(): boolean {
    const excludedRoutes = [
      '/settings/employee-fields/addholidays',
      '/settings/employee-fields/addshifts',
      '/settings/employee-fields/updateshifts/:id',
      '/settings/employee-fields/cloneshifts/:id',
      '/settings/employee-fields/viewshifts/:id',
      '/settings/employee-fields/addpolices',
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
      '/settings/employee-fields/documents',
    ];
    return !excludedRoutes.includes(this.router.url);
  }
}