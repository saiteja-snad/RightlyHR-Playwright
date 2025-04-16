import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { SettingsPersonalTabsComponent } from "../../../shared/settings-tabs/settings-personal-tabs/settings-personal-tabs.component";
import { SettingsJobTabsComponent } from "../../../shared/settings-tabs/settings-job-tabs/settings-job-tabs.component";
import { SettingsManageShitsTabsComponent } from "../../../shared/settings-tabs/settings-manage-shits-tabs/settings-manage-shits-tabs.component";
import { ManageShiftsTabsComponent } from "../../../shared/manage-shifts-tabs/manage-shifts-tabs.component";
import { ManageHolidaysTabsComponent } from "../../../shared/manage-holidays-tabs/manage-holidays-tabs.component";
import { ManagePoliciesTabsComponent } from "../../../shared/manage-policies-tabs/manage-policies-tabs.component";
import { SettingsExpenesConfigurtionsTabsComponent } from "../../../shared/settings-expenes-configurtions-tabs/settings-expenes-configurtions-tabs.component";
import { ManageWeekendsTabsComponent } from "../../../shared/settings-tabs/manage-weekends-tabs/manage-weekends-tabs.component";

@Component({
  selector: 'app-employee-fields-layout',
  imports: [CommonModule, RouterModule, SettingsEmployeeFieldsModuleTabsComponent, SettingsPersonalTabsComponent, SettingsJobTabsComponent, ManageShiftsTabsComponent, ManageHolidaysTabsComponent, ManagePoliciesTabsComponent, SettingsExpenesConfigurtionsTabsComponent, ManageWeekendsTabsComponent],
  templateUrl: './employee-fields-layout.component.html',
  styleUrl: './employee-fields-layout.component.scss'
})

export class EmployeeFieldsLayoutComponent {
  
  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}