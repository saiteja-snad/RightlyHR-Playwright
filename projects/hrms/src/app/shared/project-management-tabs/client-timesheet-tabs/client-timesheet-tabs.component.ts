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
      { label: 'Summary', link: '/project-management/clients/details/timesheet/summary', permission: { feature: 'Client Timesheets', action: 'view' } },
      { label: 'Detailed', link: '/project-management/clients/details/timesheet/detailed', permission: { feature: 'Client Detailed Tab', action: 'view' } },
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

  isDocumentTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Remove query params
    
    // For Timesheets tab, match both summary and detailed routes
    if (link === '/project-management/clients/details/timesheet') {
      return currentUrl === '/project-management/clients/details/timesheet/summary' ||
        currentUrl === '/project-management/clients/details/timesheet/detailed';
    }
    
    // For Detailed tab, match detailed route and resource-summary
    if (link === '/project-management/clients/details/timesheet/detailed') {
      return currentUrl === '/project-management/clients/details/timesheet/detailed' ||
        currentUrl === '/project-management/clients/details/timesheet/resource-summary';
    }
    
    // For Summary tab, only match summary route
    if (link === '/project-management/clients/details/timesheet/summary') {
      return currentUrl === '/project-management/clients/details/timesheet/summary';
    }
    
    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}