import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-client-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './client-tabs.component.html',
  styleUrl: './client-tabs.component.scss'
})

export class ClientTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Client Information', link: '/project-management/clients/details/info', icon: '/my-info-icons/basic-info-icon.png',
      permission: { feature: 'Client Information', action: 'view' }
    },
    {
      label: 'Contact Information', link: '/project-management/clients/details/contact-info', icon: '/my-info-icons/contact-icon.png',
      permission: { feature: 'Contact Information', action: 'view' }
    },
    {
      label: 'Projects', link: '/project-management/clients/details/projects', icon: 'main-menu-icons/project-management-project.png',
      permission: { feature: 'Client Projects', action: 'view' },
    },
    {
      label: 'Resources', link: '/project-management/clients/details/resources', icon: 'main-menu-icons/project-management-resources.png',
      permission: { feature: 'Client Resources', action: 'view' }
    },
    {
      label: 'Timesheets', link: '/project-management/clients/details/timesheet/summary', icon: 'main-menu-icons/project-management-timesheet.png',
      permission: { feature: 'Client Timesheets', action: 'view' }
    },
    {
      label: 'Documents', link: '/project-management/clients/details/documents', icon: 'main-menu-icons/project-management-documents.png',
      permission: { feature: 'Client Documents', action: 'view' }
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