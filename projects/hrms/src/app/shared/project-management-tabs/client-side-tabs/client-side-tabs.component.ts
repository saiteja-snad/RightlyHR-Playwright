import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-side-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './client-side-tabs.component.html',
  styleUrl: './client-side-tabs.component.scss'
})
export class ClientSideTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [

    {
      label: 'Active Clients', link: '/project-management/clients/active', icon: '/my-info-icons/contact-icon.png',
      permission: { feature: 'Client Projects', action: 'view' }
    },
    {
      label: 'Inactive Clients', link: '/project-management/clients/inactive', icon: 'main-menu-icons/project-management-project.png',
      permission: { feature: 'Client Projects', action: 'view' },
    },
    {
      label: 'Hold', link: '/project-management/clients/hold', icon: 'main-menu-icons/project-management-resources.png',
      permission: { feature: 'Client Resources', action: 'view' }
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


}
