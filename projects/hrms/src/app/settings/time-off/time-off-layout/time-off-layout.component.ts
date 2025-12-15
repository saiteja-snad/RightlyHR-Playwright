import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule, } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttendanceEligibilityCriteriaTabsComponent } from "../../../shared/settings-tabs/attendance-eligibility-criteria-tabs/attendance-eligibility-criteria-tabs.component";
import { LeaveCategoryTabsComponent } from "../../../shared/settings-tabs/leave-category-tabs/leave-category-tabs.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
import { WfhAllocationTabsComponent } from "../flexible-wfh-allocation/wfh-allocation-tabs/wfh-allocation-tabs.component";
import { HoursAllocationTabsComponent } from "../flexible-hours-allocation/hours-allocation-tabs/hours-allocation-tabs.component";
import { LeaveEntitlementSideBarComponent } from "../../../shared/leave-entitlement-side-bar/leave-entitlement-side-bar.component";
@Component({
  selector: 'app-time-off-layout',
  imports: [RouterModule, CommonModule, AttendanceEligibilityCriteriaTabsComponent, LeaveCategoryTabsComponent,
    NgbPopoverModule, SettingsHeaderComponent, WfhAllocationTabsComponent, HoursAllocationTabsComponent, LeaveEntitlementSideBarComponent],
  templateUrl: './time-off-layout.component.html',
  styleUrl: './time-off-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class TimeOffLayoutComponent implements OnInit {
  moduleinfo: string = '';

  constructor(public readonly router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
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
      '/settings/timeoff-configurations/load-entitlements': MODULE_INFOS.SETTINGS_LOAD_ENTITLEMENT_MODULE_INFO,
      '/settings/timeoff-configurations/flexible-wfh-allocation': MODULE_INFOS.SETTINGS_FLEXIBLE_LEAVE_ALLOCATION_MODULE_INFO,
      '/settings/timeoff-configurations/flexible-workhours-allocation': MODULE_INFOS.SETTINGS_FLEXIBLE_LEAVE_ALLOCATION_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  carryforwordnavigation() {
    this.router.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-create']);
  }
  initialentitlements(){
    this.router.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-create']);
  }
}