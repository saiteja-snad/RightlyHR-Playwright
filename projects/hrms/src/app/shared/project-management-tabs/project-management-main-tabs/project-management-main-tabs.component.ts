import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-project-management-main-tabs',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule],
  templateUrl: './project-management-main-tabs.component.html',
  styleUrl: './project-management-main-tabs.component.scss'
})

export class ProjectManagementMainTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  empinfo: any;
  navTabs: any[] = [];
  columnsPerRow = 3;

  constructor(public readonly router: Router, private rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.navTabs = [
      { label: 'Clients', link: '/project-management/clients', icon: 'main-menu-icons/project-management-client.png', permission: { feature: 'Clients', action: 'view' } },
      { label: 'Projects', link: '/project-management/projects', icon: 'main-menu-icons/project-management-project.png', permission: { feature: 'Projects', action: 'view' } },
      { label: 'Time Sheets', link: '/project-management/time-sheet', icon: 'main-menu-icons/project-management-timesheet.png', permission: { feature: 'Time Sheet', action: 'view' } },
    ];
    this.filterTabsByRbac();
  }

  Route(link: string): void {
    if (link) {
      this.router.navigate([link]);
      localStorage.removeItem('clientProjectId');
    }
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