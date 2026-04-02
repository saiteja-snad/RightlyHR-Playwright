import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-helpdesk-management-config-tabs',
   imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './helpdesk-management-config-tabs.component.html',
  styleUrl: './helpdesk-management-config-tabs.component.scss'
})
export class HelpdeskManagementConfigTabsComponent {
 filteredTabs: any[] = [];

  allNavLinks = [
    { label: 'Category', route: '/settings/helpdesk-management-config/categeory', permission: { feature: 'Category', action: 'view' }},
    { label: 'Subcategory', route: '/settings/helpdesk-management-config/subcategeory', permission: { feature: 'Subcategory', action: 'view' }},
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
