import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-settings-time-off-tabs',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './settings-time-off-tabs.component.html',
  styleUrl: './settings-time-off-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsTimeOffTabsComponent {
  navTabs: any[] = [];
  allTabs = [
    {
      label: 'Leave Category',
      link: '/settings/timeoff-configurations/leave-categoery',
      permission: { feature: 'Leave Category Tab', action: 'view' },
      icon:'/settings-icon/leave-category-icon.png',
      subjectText:MODULE_INFOS.SETTINGS_LEAVE_CATEGORY_MODULE_INFO,
    },
    {
      label: 'Leave Allocation',
      link: '/settings/timeoff-configurations/leave-allocation',
      permission: { feature: 'Leave Allocation Tab', action: 'view' },
      icon:'/settings-icon/leave-allocations-icon.png',
      subjectText:MODULE_INFOS.SETTINGS_LEAVE_ALLOCATION_MODULE_INFO,
    },
    {
      label: 'Flexible Leave Allocation',
      link: '/settings/timeoff-configurations/flexible-leave-allocation',
      permission: { feature: 'Flexible Leave Allocation Tab', action: 'view' },
      icon:'/settings-icon/flexible-leave-allocation-icon.png',
      subjectText:MODULE_INFOS.SETTINGS_FLEXIBLE_LEAVE_ALLOCATION_MODULE_INFO,
    },
    {
      label: 'Attendance Eligibility Criteria',
      link: '/settings/timeoff-configurations/eligibility-criterias',
      permission: { feature: 'Attendance Eligibility Criteria Tab', action: 'view' },
      icon:'/settings-icon/attendance-eligibility-icon.png',
      subjectText:MODULE_INFOS.SETTINGS_ATTENDANCE_ELIGIBILITY_CRITERIA_MODULE_INFO,
    },
    {
      label: 'Load Entitlements',
      link: '/settings/timeoff-configurations/load-entitlements',
      permission: { feature: 'Load Entitlements Tab', action: 'view' },
      icon:'/settings-icon/load-entitlement-icon.png',
      subjectText:MODULE_INFOS.SETTINGS_LOAD_ENTITLEMENT_MODULE_INFO,
    }
  ];

  constructor(
    public rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.navTabs = this.allTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
}