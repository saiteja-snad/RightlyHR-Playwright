import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-settings-time-off-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './settings-time-off-tabs.component.html',
  styleUrl: './settings-time-off-tabs.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class SettingsTimeOffTabsComponent {

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
    { label: 'Leave Category',link: '/settings/timeoff-configurations/leave-categoery',permission: { feature: 'Leave Category Tab', action: 'view' } },
    { label: 'Leave Allocation',link: '/settings/timeoff-configurations/leave-allocation',permission: { feature: 'Leave Allocation Tab', action: 'view' } },
    { label: 'Flexible Leave Allocation',link: '/settings/timeoff-configurations/flexible-leave-allocation',permission: { feature: 'Flexible Leave Allocation Tab', action: 'view' } },
    { label: 'Attendance Eligibility Criteria',link: '/settings/timeoff-configurations/eligibility-criterias',permission: { feature: 'Attendance Eligibility Criteria Tab', action: 'view' } },
    { label: 'Load Entitlements',link: '/settings/timeoff-configurations/load-entitlements',permission: { feature: 'Load Entitlements Tab', action: 'view' } }
  ];
}