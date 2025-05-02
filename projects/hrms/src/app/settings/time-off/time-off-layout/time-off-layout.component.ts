import { Component } from '@angular/core';
import { Router, RouterModule, } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsTimeOffTabsComponent } from "../../../shared/settings-tabs/settings-time-off-tabs/settings-time-off-tabs.component";
import { AttendanceEligibilityCriteriaTabsComponent } from "../../../shared/settings-tabs/attendance-eligibility-criteria-tabs/attendance-eligibility-criteria-tabs.component";
import { LeaveCategoryTabsComponent } from "../../../shared/settings-tabs/leave-category-tabs/leave-category-tabs.component";
@Component({
  selector: 'app-time-off-layout',
  imports: [RouterModule, CommonModule, SettingsTimeOffTabsComponent, AttendanceEligibilityCriteriaTabsComponent, LeaveCategoryTabsComponent],
  templateUrl: './time-off-layout.component.html',
  styleUrl: './time-off-layout.component.scss'
})

export class TimeOffLayoutComponent {
  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}