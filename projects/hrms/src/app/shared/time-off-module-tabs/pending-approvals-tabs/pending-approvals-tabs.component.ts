import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { HttpService } from '../../../services/http.service';
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
  approvalCounts: any[] = [];
  timeOffTotalCount: number = 0;

  constructor(public readonly router: Router, private http: HttpService, private rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.allowedWfh = this.empinfo.allowWFH;
    this.allowRemoteLogin = this.empinfo.allowRemoteLogin;
     // Subscribe to live updates
      this.http.pendingApprovalCount$.pipe(takeUntil(this.destroy$)).subscribe(counts => {
          if (counts) {
            this.approvalCounts = counts;
            this.getApprovalStatusCounts();
          }
        });

  // Load initial data
    this.navTabs = [
      { label: 'Time-Off', link: '/pending-approvals/time-off', icon: '/main-menu-icons/Time-off-settings-icon.png', permission: { feature: 'Time Off main Tab', action: 'view' }, moduleIds: [2, 1, 11, 3, 18, 31, 17] },
      { label: 'Onboarding', link: '/pending-approvals/on-boarding', icon: '/images/onboarding.png', permission: { feature: 'Onboarding main Tab', action: 'view' }, moduleIds: [20, 15] },
      { label: 'Contractors', link: '/pending-approvals/contractors', icon: '/my-info-icons/contractor.png', permission: { feature: 'Contractors main Tab', action: 'view' }, moduleIds: [25, 26] },
      { label: 'Offboarding', link: '/pending-approvals/off-boarding', icon: '/images/sepration-request.png', permission: { feature: 'Offboarding main Tab', action: 'view' }, moduleIds: [13, 14] },
      { label: 'Desks', link: '/pending-approvals/desk-approval', icon: '/main-menu-icons/desk-icon.png', permission: { feature: 'Desk Requests Tab', action: 'view' }, moduleIds: [23] },
      { label: 'Expenses', link: '/pending-approvals/claimsandexpenses-request', icon: '/main-menu-icons/expenses-icon.png', permission: { feature: 'Claims and Expenses Tab', action: 'view' }, moduleIds: [19] },
      { label: 'Timesheets', link: '/pending-approvals/time-sheets', icon: '/time-off-icon/calender-activity.png', permission: { feature: 'Time Sheet approval Tab', action: 'view' }, moduleIds: [30] },
      { label: 'Employee Info', link: '/pending-approvals/employeeinfo-request', icon: '/time-off-icon/employee-info-approvals.png', permission: { feature: 'EmployeeInfo Tab', action: 'view' },moduleIds: [32]  }
    ];
    this.getApprovalStatusCounts();
     this.filterTabsByRbac();

}
  
  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.approvalCounts = res;
      this.updateTabCounts();   //Map counts to tabs
    });
  }

  updateTabCounts() {
    this.navTabs.forEach(tab => {
      let total = 0;
      tab.moduleIds.forEach((id: any) => {
        const result = this.approvalCounts.find(x => x.moduleId === id);
        if (result) {
          total += result.totalCount;
        }
      });
      tab.totalCount = total;   //  store final count
    });
    // filter again because now count is available
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