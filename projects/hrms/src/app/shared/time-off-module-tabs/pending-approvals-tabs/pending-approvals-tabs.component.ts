import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-pending-approvals-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-approvals-tabs.component.html',
  styleUrl: './pending-approvals-tabs.component.scss',
})

export class PendingApprovalsTabsComponent {
  filteredTabs: any[] = [];
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  empinfo: any;
  allowedWfh: boolean = false;
  allowRemoteLogin: boolean = false;
  navTabs: any[] = [];
  columnsPerRow = 3;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public readonly router: Router, private rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.allowedWfh = this.empinfo.allowWFH;
    this.allowRemoteLogin = this.empinfo.allowRemoteLogin;
    this.navTabs = [
      { label: 'Time-Off', link: '/pending-approvals/time-off', icon: '/time-off-icon/leaves-icon.png', permission: { feature: 'Time Off main Tab', action: 'view' } },
      { label: 'Onboarding', link: '/pending-approvals/on-boarding', icon: '/time-off-icon/Probation-icon.png', permission: { feature: 'Onboarding main Tab', action: 'view' } },
      { label: 'Contractors', link: '/pending-approvals/contractors', icon: '/time-off-icon/trainee-icon.png', permission: { feature: 'Contractors main Tab', action: 'view' } },
      { label: 'Offboarding', link: '/pending-approvals/off-boarding', icon: '/time-off-icon/seperation-icon.png', permission: { feature: 'Offboarding main Tab', action: 'view' } },
      { label: 'Desks', link: '/pending-approvals/desk-approval', icon: '/main-menu-icons/desk-icon.png', permission: { feature: 'Desk Requests Tab', action: 'view' } },
      { label: 'Expenses', link: '/pending-approvals/claimsandexpenses-request', icon: '/main-menu-icons/expenses-icon.png', permission: { feature: 'Claims and Expenses Tab', action: 'view' } },
      { label: 'Timesheets', link: '/pending-approvals/time-sheets', icon: '/time-off-icon/calender-activity.png', permission: { feature: 'Time Sheet approval Tab', action: 'view' } }
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}