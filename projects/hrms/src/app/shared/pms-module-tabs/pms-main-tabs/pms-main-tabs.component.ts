import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-pms-main-tabs',
  imports: [CommonModule, TranslateModule],
  templateUrl: './pms-main-tabs.component.html',
  styleUrl: './pms-main-tabs.component.scss'
})

export class PmsMainTabsComponent {
  filteredTabs: any[] = [];
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  empinfo: any;
  columnsPerRow = 3;
  navTabs = [
    { label: 'Review Cycle', link: '/pms/review-cycle', icon: 'main-menu-icons/project-management-client.png', permission: { feature: 'Review Cycle List', action: 'view' } },
    { label: 'Performance Review', link: '/pms/performace-review', icon: 'main-menu-icons/project-management-client.png', permission: { feature: 'Review Cycle List', action: 'view' } },
    { label: 'KRA', link: '/pms/kra', icon: 'main-menu-icons/kra.png', permission: { feature: 'KRA', action: 'view' } },
    { label: 'KPI', link: '/pms/kpi', icon: 'main-menu-icons/kpi.png', permission: { feature: 'KPI', action: 'view' } },
    { label: 'Assign KRA/KPI', link: '/pms/assign-kra-kpi', icon: 'main-menu-icons/assign-kra-kpi.png', permission: { feature: 'Assign KRA KPI', action: 'view' } },
    { label: 'KRA/KPI', link: '/pms/kpi-kra', icon: 'main-menu-icons/my-kra-kpi.png', permission: { feature: 'My KRA KPI', action: 'view' } },
  ];

  constructor(public readonly router: Router, private rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
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

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    // Exact match or starts with followed by `/` to avoid partial matches
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  // Check if item is in the first row
  isInTopRow(index: number): boolean {
    return Math.floor(index / this.columnsPerRow) === 0;
  }

  // Check if item is in the last row
  isInLastRow(index: number): boolean {
    const totalRows = Math.ceil(this.filteredTabs.length / this.columnsPerRow);
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