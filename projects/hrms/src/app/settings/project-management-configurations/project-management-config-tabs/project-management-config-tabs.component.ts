import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-management-config-tabs',
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './project-management-config-tabs.component.html',
  styleUrl: './project-management-config-tabs.component.scss'
})
export class ProjectManagementConfigTabsComponent {
  filteredTabs: any[] = [];

  allNavLinks = [
    { label: 'Project Type', route: '/settings/project-management-config/project-type', permission: { feature: 'Project Type', action: 'view' }},
    { label: 'Industry Type', route: '/settings/project-management-config/industry-type', permission: { feature: 'Industry Type', action: 'view' }},
    { label: 'Client Document Type', route: '/settings/project-management-config/client-document-type', permission: { feature: 'Client Document Type', action: 'view' }},
    { label: 'Project Document Type', route: '/settings/project-management-config/project-document-type', permission: { feature: 'Project Document Type', action: 'view' }},
    { label: 'Letter Configurations', route: '/settings/project-management-config/letter-type', permission: { feature: 'Letter Configurations', action: 'view' }},
    { label: 'Project Management Authority', route: '/settings/project-management-config/signature-authority', permission: { feature: 'Project Management Authority', action: 'view' }}
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.allNavLinks.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}
