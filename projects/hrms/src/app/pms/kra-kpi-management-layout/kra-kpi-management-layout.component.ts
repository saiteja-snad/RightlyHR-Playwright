import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';

import {RbacService} from '../../services/rbac.service'

@Component({
  selector: 'app-kra-kpi-management-layout',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule],
  templateUrl: './kra-kpi-management-layout.component.html',
  styleUrl: './kra-kpi-management-layout.component.scss'
})
export class KraKpiManagementLayoutComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'My KRA/KPI', link: '/pms/my-kra-kpi/view', icon: 'main-menu-icons/skill-dashboard.png',
      permission: { feature: 'My KRA KPI', action: 'view' } },
    { label: 'Dashboard', link: '/pms/my-kra-kpi/dashboard', icon: 'main-menu-icons/skill-directory.png',
      permission: { feature: 'My KRA KPI', action: 'view' } },
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
