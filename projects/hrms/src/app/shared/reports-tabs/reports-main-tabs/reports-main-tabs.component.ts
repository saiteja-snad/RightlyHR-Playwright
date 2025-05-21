import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
@Component({
  selector: 'app-reports-main-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './reports-main-tabs.component.html',
  styleUrl: './reports-main-tabs.component.scss'
})

export class ReportsMainTabsComponent implements OnInit {
  navTabs: any[] = [];
  allTabs: any[] = [
    { label: 'Standard Reports', link: '/reports/standard-reports', permission: { feature: 'Standard Reports', action: 'view' } },
    { label: 'Custom Reports', link: '/reports/custom-reports', permission: { feature: 'Custom Reports', action: 'view' } },
    { label: 'Attendance Reports', link: '/reports/attendence-reports', permission: { feature: 'Attendance Reports', action: 'view' } },
    { label: 'Monthly Attendance Report', link: '/reports/monthly-attandance-reports', permission: { feature: 'Monthly Attendance Reports', action: 'view' } },
  ];
  columnsPerRow = 3;

  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.navTabs = this.allTabs.filter(tab => {
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