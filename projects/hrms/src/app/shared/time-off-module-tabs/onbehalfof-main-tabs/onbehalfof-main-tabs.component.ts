import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onbehalfof-main-tabs',
  imports: [CommonModule],
  templateUrl: './onbehalfof-main-tabs.component.html',
  styleUrl: './onbehalfof-main-tabs.component.scss'
})

export class OnbehalfofMainTabsComponent {
  filteredTabs: any[] = [];
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  empinfo: any;
  allowedWfh: boolean = false;
  allowRemoteLogin: boolean = false;
  navTabs: any[] = [];
  columnsPerRow = 3;

  constructor(public readonly router: Router, private rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.allowedWfh = this.empinfo.allowWFH;
    this.allowRemoteLogin = this.empinfo.allowRemoteLogin;
    this.navTabs = [
      { label: 'WFH', link: '/on-behalf-of/on-behalf-of-wfh', icon: '/time-off-icon/WFH-icon.png', permission: { feature: 'On Behalf Of WFH', action: 'view' } },
      // { label: 'Regularization', link: '/time-off/regularization', icon: '/time-off-icon/regularization-icon.png', permission: { feature: 'Regularization Module', action: 'view' } },
    ];
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