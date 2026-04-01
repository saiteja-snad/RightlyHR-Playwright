import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { RbacService } from '../../services/rbac.service';


@Component({
  selector: 'app-helpdesk-header-tabs',
    imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './helpdesk-header-tabs.component.html',
  styleUrl: './helpdesk-header-tabs.component.scss'
})
export class HelpdeskHeaderTabsComponent implements OnInit{
filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];

  constructor(private rbac: RbacService, private router: Router,
    private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.navTabs = [
      { label: 'My Queries', link: '/help-desk/employee-desk', icon:'/it-support-icons/mytickets.png' ,permission: { feature: 'Employee Helpdesk Queries Tab', action: 'view' } },
      { label: 'Team Queries', link: '/help-desk/support-desk', icon:'/it-support-icons/teamtickets.png' , permission: { feature: 'Support Helpdesk Queries Tab', action: 'view' } },
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
