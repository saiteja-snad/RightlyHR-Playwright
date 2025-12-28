import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../services/rbac.service'
@Component({
  selector: 'app-kra-kpi-management-layout',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule],
  templateUrl: './kra-kpi-management-layout.component.html',
  styleUrl: './kra-kpi-management-layout.component.scss'
})

export class KraKpiManagementLayoutComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Dashboard', link: '/pms/kpi-kra/dashboard', icon: 'main-menu-icons/kra-kpi-dashboard.png',
      permission: { feature: 'Dashboard KRA KPI', action: 'view' }
    },
    {
      label: "My KRA/KPI's", link: '/pms/kpi-kra/my-kpi-kra', icon: 'main-menu-icons/my-kra-kpi.png',
      permission: { feature: 'My KRA KPI', action: 'view' }
    },
    {
      label: "Team KRA/KPI's", link: '/pms/kpi-kra/team', icon: 'main-menu-icons/team-kra-kpi.png',
      permission: { feature: 'Team KRA KPI', action: 'view' }
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
