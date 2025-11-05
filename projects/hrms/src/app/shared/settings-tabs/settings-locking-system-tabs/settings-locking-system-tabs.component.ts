import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-settings-locking-system-tabs',
   imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './settings-locking-system-tabs.component.html',
  styleUrl: './settings-locking-system-tabs.component.scss'
})
export class SettingsLockingSystemTabsComponent {
  navTabs: any[] = [];
  allTabs = [
    // projects\hrms\public\main-menu-icons\attendance-locking-icon.png
    {
      label: 'Attendance Locking',
      link: '/settings/attendance-configuration',
      permission: { feature: 'Attendance Configuration Module', action: 'view' },
      icon:'/main-menu-icons/attendance-locking-icon.png',
      subjectText:MODULE_INFOS.SETTINGS_ATTENDANCE_CONFIGURATION_MODULEE_INFO,
    },
    {
      label: 'Timesheet Locking',
      link: '/settings/timesheet-locking-configuration',
      permission: { feature: 'Timesheet Configuration Module', action: 'view' },
      icon:'/main-menu-icons/project-management-timesheet.png',
      subjectText:MODULE_INFOS.SETTINGS_TIMESHEETLOCKING_MODULE_INFO,
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
