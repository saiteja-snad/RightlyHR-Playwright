import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-timesheets-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './timesheets-tabs.component.html',
  styleUrl: './timesheets-tabs.component.scss'
})

export class TimesheetsTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'My Timesheets', link: '/project-management/timesheet/mytimesheet', icon: '/icons/my-timesheet-icon.png',
      permission: { feature: 'Time Sheet', action: 'view' }
    },
    {
      label: 'Team Timesheets', link: '/project-management/timesheet/teamtimesheet', icon: '/icons/team-timesheet-icon.png',
      permission: { feature: 'Team Time Sheet', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
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

  isTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Remove query params

    // For My Timesheets tab, include mysummary page
    if (link === '/project-management/timesheet/mytimesheet') {
      return currentUrl === link || currentUrl === '/project-management/timesheet/mysummary';
    }

    // For Team Timesheets tab, include summary page
    if (link === '/project-management/timesheet/teamtimesheet') {
      return currentUrl === link || currentUrl === '/project-management/timesheet/summary';
    }



    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}