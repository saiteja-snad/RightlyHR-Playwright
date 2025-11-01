import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-client-timesheet-tabs',
  imports: [CommonModule, TabsModule, RouterModule, TranslateModule],
  templateUrl: './client-timesheet-tabs.component.html',
  styleUrl: './client-timesheet-tabs.component.scss',
})

export class ClientTimesheetTabsComponent {
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];

  constructor(private rbac: RbacService, private router: Router) { }

  ngOnInit(): void {
    this.navTabs = [
      { label: 'Summary', link: '/project-management/clients/details/timesheet/summary', permission: { feature: 'Project Details Tab', action: 'view' } },
      { label: 'Detailed', link: '/project-management/clients/details/timesheet/detailed', permission: { feature: 'Contact Info Tab', action: 'view' } },
    ];
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

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    // Exact match or starts with followed by `/` to avoid partial matches
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  isDocumentTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Remove query params
    // For Documents tab, check both documents and inactivedocuments routes
    if (link === '/project-management/projects/details/documents') {
      return currentUrl.includes('/project-management/projects/details/documents') ||
        currentUrl.includes('/project-management/projects/details/inactivedocuments');
    }
    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}