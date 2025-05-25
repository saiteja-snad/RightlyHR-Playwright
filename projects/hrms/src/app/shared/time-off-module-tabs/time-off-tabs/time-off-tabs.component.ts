import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-time-off-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './time-off-tabs.component.html',
  styleUrl: './time-off-tabs.component.scss',
})

export class TimeOffTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  empinfo: any;
  allowedWfh: boolean = false;
  navTabs: any[] = [];
  columnsPerRow = 3;

  constructor(public readonly router: Router, private rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.allowedWfh = this.empinfo.allowWFH;
    this.navTabs = [
      { label: 'Time-Off', link: '/time-off/leaves',icon:'/time-off-icon/leaves-icon.png', permission: { feature: 'Time Off Module', action: 'view' } },
      ...(!this.allowedWfh ? [{ label: 'WFH', link: '/time-off/wfh', icon:'/time-off-icon/WFH-icon.png', permission: { feature: 'WFH/On Duty Module', action: 'view' } }] : []),
      ...(this.allowedWfh ? [{ label: 'Remote Login', link: '/time-off/remote', icon:'/time-off-icon/WFH-icon.png', permission: { feature: 'Remote Login Module', action: 'view' } }] : []),
      { label: 'Comp-Off', link: '/time-off/comp-off', icon:'/time-off-icon/comp-off.png', permission: { feature: 'Comp Off Module', action: 'view' } },
      { label: 'Permissions', link: '/time-off/premissions', icon:'/time-off-icon/permissions-icon.png', permission: { feature: 'Permissions Module', action: 'view' } },
      { label: 'Regularization', link: '/time-off/regularization',icon:'/time-off-icon/regularization-icon.png', permission: { feature: 'Regularization Module', action: 'view' } },
      { label: 'Pending Approvals', link: '/time-off/pending-approvals',icon:'/time-off-icon/pending-approvals-icon.png', permission: { feature: 'Pending Approvals Module', action: 'view' } },
      { label: 'On Behalf Of', link: '/time-off/on-behalf-of',icon:'/time-off-icon/on-behalf-of-icon.png', permission: { feature: 'On Behalf Of Module', action: 'view' } },
      { label: 'On Behalf Of Approvals', link: '/time-off/on-behalf-of-approvals',icon:'/time-off-icon/on-behalf-of-approvals-icon.png', permission: { feature: 'On Behalf Of Approvals Module', action: 'view' } },
      { label: 'Global-Permissions', link: '/time-off/global-permissions',icon:'/time-off-icon/Global-Permissions-icon.png', permission: { feature: 'Global Permissions Module', action: 'view' } }
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