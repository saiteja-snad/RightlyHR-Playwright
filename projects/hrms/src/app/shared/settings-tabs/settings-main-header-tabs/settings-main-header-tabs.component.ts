import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-settings-main-header-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-main-header-tabs.component.html',
  styleUrl: './settings-main-header-tabs.component.scss',
})
export class SettingsMainHeaderTabsComponent implements OnInit {
  public navTabs: any[] = [];

  private allNavTabs = [
    { label: 'Employee Fields', link: '/settings/employee-fields', permission: { feature: 'Employee Fields Module', action: 'view' } },
    { label: 'Roles', link: '/settings/roles-permissions' },
    { label: 'Time Off', link: '/settings/timeoff-configurations', permission: { feature: 'Settings Timeoff Module', action: 'view' } },
    { label: 'Asset Configuration', link: '/settings/assets-configuration', permission: { feature: 'Assets Management Configuration Module', action: 'view' } },
    { label: 'Dynamic Forms', link: '/settings/dynamic-forms', permission: { feature: 'Dynamic Forms Module', action: 'view' } }
  ];

  constructor(public rbac: RbacService, private router: Router,private accessNav: AccessNavigationService) {}

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(){
    // Filter tabs based on permissions
    this.navTabs = this.allNavTabs.filter(tab => {
      if (!tab.permission) return true;
      return this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`);
    });
  }


  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
}