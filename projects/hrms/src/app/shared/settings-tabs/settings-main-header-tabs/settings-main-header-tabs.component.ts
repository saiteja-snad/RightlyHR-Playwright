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
    { label: 'Employee Fields', link: '/settings/employee-fields', icon:'/main-menu-icons/Employee-Fields-icon.png', permission: { feature: 'Employee Fields Module', action: 'view' } },
    { label: 'Roles', link: '/settings/roles-permissions', icon:'/main-menu-icons/Roles-icon.png', },
    { label: 'Time Off', link: '/settings/timeoff-configurations', icon:'/main-menu-icons/Time-off-settings-icon.png', permission: { feature: 'Settings Timeoff Module', action: 'view' } },
    { label: 'Asset Configuration', link: '/settings/assets-configuration', icon:'/main-menu-icons/Asset-configuration-icon.png', permission: { feature: 'Assets Management Configuration Module', action: 'view' } },
    { label: 'Dynamic Forms', link: '/settings/dynamic-forms', icon:'/main-menu-icons/Dynamic-Form-icon.png', permission: { feature: 'Dynamic Forms Module', action: 'view' } },
     { label: 'Company Settings', link: '/settings/company-settings', icon:'/main-menu-icons/Dynamic-Form-icon.png', permission: { feature: 'Dynamic Forms Module', action: 'view' } }
  ];
  columnsPerRow = 3;

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

    // Check if item is in the first row
  isInTopRow(index: number): boolean {
    return Math.floor(index / this.columnsPerRow) === 0;
  }

  // Check if item is in the last row
  isInLastRow(index: number): boolean {
    const totalRows = Math.ceil(this.navTabs.length / this.columnsPerRow);
    const currentRow = Math.floor(index / this.columnsPerRow) + 1;
    return currentRow === totalRows;
  }

  // Check if item is in a middle row
  isInMiddleRow(index: number): boolean {
    return !this.isInTopRow(index) && !this.isInLastRow(index);
  }

  // Check if item is in the first column
  isFirstColumn(index: number): boolean {
    return index % this.columnsPerRow === 0;
  }

  // Check if item is in the last column
  isLastColumn(index: number): boolean {
    return (index + 1) % this.columnsPerRow === 0;
  }

  // Check if item is in a middle column
  isMiddleColumn(index: number): boolean {
    return !this.isFirstColumn(index) && !this.isLastColumn(index);
  }
}