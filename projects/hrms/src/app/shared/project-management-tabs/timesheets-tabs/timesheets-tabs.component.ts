import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

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
      permission: { feature: 'My Time Sheet', action: 'view' }
    },
    {
      label: 'Team Timesheets', link: '/project-management/timesheet/teamtimesheet', icon: '/icons/team-timesheet-icon.png',
      permission: { feature: 'Team Time Sheet', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private router: Router) { }

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

  isDocumentTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Remove query params

    // For Documents tab, check both documents and inactivedocuments routes
    if (link === '/project-management/clients/details/documents') {
      return currentUrl.includes('/project-management/clients/details/documents') ||
        currentUrl.includes('/project-management/clients/details/inactivedocuments');
    }

    // For Projects tab, check both projects and inactiveprojects routes
    if (link === '/project-management/clients/details/projects') {
      return currentUrl.includes('/project-management/clients/details/projects') ||
        currentUrl.includes('/project-management/clients/details/inactiveprojects');
    }

    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}