import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-project-tabs',
  imports: [CommonModule, TabsModule, RouterModule, TranslateModule],
  templateUrl: './project-tabs.component.html',
  styleUrl: './project-tabs.component.scss'
})

export class ProjectTabsComponent {
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs = [
    { label: 'Project Info', link: '/project-management/projects/details/information', permission: { feature: 'Project Details Tab', action: 'view' } },
    { label: 'Contact Info', link: '/project-management/projects/details/contact-info', permission: { feature: 'Contact Info Tab', action: 'view' } },
    { label: 'Documents', link: '/project-management/projects/details/documents', permission: { feature: 'Documents Tab', action: 'view' } },
    { label: 'Resources', link: '/project-management/projects/details/resources', permission: { feature: 'Resources Tab', action: 'view' } },
    { label: 'Timesheets', link: '/project-management/projects/details/timesheet/summary', permission: { feature: 'Project Timesheets Tab', action: 'view' } }
  ];

  constructor(private rbac: RbacService, private router: Router) { }

  ngOnInit(): void {
    this.navTabs = [
      { label: 'Project Info', link: '/project-management/projects/details/information', permission: { feature: 'Project Details Tab', action: 'view' } },
      { label: 'Phases/Milestones', link: '/project-management/projects/details/phases', permission: { feature: 'Project Details Tab', action: 'view' } },
      { label: 'Contact Info', link: '/project-management/projects/details/contact-info', permission: { feature: 'Contact Info Tab', action: 'view' } },
      { label: 'Documents', link: '/project-management/projects/details/documents', permission: { feature: 'Documents Tab', action: 'view' } },
      { label: 'Resources', link: '/project-management/projects/details/resources', permission: { feature: 'Resources Tab', action: 'view' } },
      { label: 'Timesheets', link: '/project-management/projects/details/timesheet', permission: { feature: 'Project Timesheets Tab', action: 'view' } }
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
    if (link === '/project-management/projects/details/timesheet/summary') {
      return currentUrl.includes('/project-management/projects/details/timesheet/detailed') ||
        currentUrl.includes('/project-management/projects/details/timesheet/summary')
        || currentUrl.includes('/project-management/projects/details/timesheet/resource-summary');  
    }
    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}