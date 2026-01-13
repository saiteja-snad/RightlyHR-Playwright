import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-actions-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './global-actions-tabs.component.html',
  styleUrl: './global-actions-tabs.component.scss'
})

export class GlobalActionsTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Permissions', link: '/on-behalf-of/global/permissions', icon: '/time-off-icon/permissions-icon.png',
      permission: { feature: 'Global Permissions Module', action: 'view' }
    },
    {
      label: 'WFH', link: '/on-behalf-of/global/wfh', icon: '/time-off-icon/WFH-icon.png',
      permission: { feature: 'Global Permissions Module', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService) { }

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
}