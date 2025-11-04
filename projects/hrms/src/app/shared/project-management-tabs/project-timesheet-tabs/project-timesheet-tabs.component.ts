import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-project-timesheet-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './project-timesheet-tabs.component.html',
  styleUrl: './project-timesheet-tabs.component.scss'
})

export class ProjectTimesheetTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Summary', link: '/project-management/projects/details/timesheet/summary', icon: '/icons/project-summary-icon.png',
      permission: { feature: 'Project Timesheets Tab', action: 'view' }
    },
    {
      label: 'Detailed', link: '/project-management/projects/details/timesheet/detailed', icon: '/icons/project-detailed-icon.png',
      permission: { feature: 'Project Detailed Tab', action: 'view' }
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