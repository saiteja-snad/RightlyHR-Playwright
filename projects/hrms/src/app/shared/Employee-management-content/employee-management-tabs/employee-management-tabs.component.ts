import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-management-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './employee-management-tabs.component.html',
  styleUrl: './employee-management-tabs.component.scss'
})

export class EmployeeManagementTabsComponent {
  navTabs: any[] = [];
  allTabs: any[] = [
    { label: 'All Employee', link: '/employee-management', icon: '/main-menu-icons/all-employees-icon.png'},
    { label: 'Generate Documents', link: '/letters/offer-letter', icon: '/main-menu-icons/generate-documents.png'},
    { label: 'Invite New User', link: '/invite-user', icon: '/main-menu-icons/invite-new-user.png'},
  ];
  
  columnsPerRow = 3;

  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    // this.filterTabsByRbac();
  }

  // filterTabsByRbac(): void {
  //   this.navTabs = this.allTabs.filter(tab => {
  //     if (!tab.permission) return true;
  //     const { feature, action } = tab.permission;
  //     const permissionString = `${feature}.${action}`;
  //     return this.rbac.allowedToAccess(permissionString);
  //   });
  // }

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