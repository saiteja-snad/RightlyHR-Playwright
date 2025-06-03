import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule, } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsTimeOffTabsComponent } from "../../../shared/settings-tabs/settings-time-off-tabs/settings-time-off-tabs.component";
import { AttendanceEligibilityCriteriaTabsComponent } from "../../../shared/settings-tabs/attendance-eligibility-criteria-tabs/attendance-eligibility-criteria-tabs.component";
import { LeaveCategoryTabsComponent } from "../../../shared/settings-tabs/leave-category-tabs/leave-category-tabs.component";
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
@Component({
  selector: 'app-time-off-layout',
  imports: [RouterModule, CommonModule, SettingsTimeOffTabsComponent, AttendanceEligibilityCriteriaTabsComponent, LeaveCategoryTabsComponent, ModuleInformationComponent, NgbPopoverModule, SettingsHeaderComponent],
  templateUrl: './time-off-layout.component.html',
  styleUrl: './time-off-layout.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class TimeOffLayoutComponent implements OnInit {
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

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/timeoff-configurations/leave-categoery': MODULE_INFOS.SETTINGS_LEAVE_CATEGORY_MODULE_INFO,
      '/settings/timeoff-configurations/leave-allocation': MODULE_INFOS.SETTINGS_LEAVE_ALLOCATION_MODULE_INFO,
      '/settings/timeoff-configurations/flexible-leave-allocation': MODULE_INFOS.SETTINGS_FLEXIBLE_LEAVE_ALLOCATION_MODULE_INFO,
      '/settings/timeoff-configurations/eligibility-criterias': MODULE_INFOS.SETTINGS_ATTENDANCE_ELIGIBILITY_CRITERIA_MODULE_INFO,
      '/settings/timeoff-configurations/load-entitlements': MODULE_INFOS.SETTINGS_LOAD_ENTITLEMENT_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}