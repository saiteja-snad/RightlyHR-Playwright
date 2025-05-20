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

  constructor(public readonly router: Router, private rbac: RbacService,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.allowedWfh = this.empinfo.allowWFH;
    this.navTabs = [
      { label: 'Time-Off', link: '/time-off/leaves', permission: { feature: 'Time Off Module', action: 'view' } },
      ...(!this.allowedWfh ? [{ label: 'WFH', link: '/time-off/wfh', permission: { feature: 'WFH/On Duty Module', action: 'view' } }] : []),
      ...(this.allowedWfh ? [{ label: 'Remote Login', link: '/time-off/remote', permission: { feature: 'Remote Login Module', action: 'view' } }] : []),
      { label: 'Comp-Off', link: '/time-off/comp-off', permission: { feature: 'Comp Off Module', action: 'view' } },
      { label: 'Permissions', link: '/time-off/premissions', permission: { feature: 'Permissions Module', action: 'view' } },
      { label: 'Regularization', link: '/time-off/regularization', permission: { feature: 'Regularization Module', action: 'view' } },
      { label: 'Pending Approvals', link: '/time-off/pending-approvals',permission: { feature: 'Pending Approvals Module', action: 'view' } },
      { label: 'Attendance', link: '/time-off/attendance',permission: { feature: 'Attendance Module', action: 'view' } },
      { label: 'On Behalf Of', link: '/time-off/on-behalf-of', permission: { feature: 'On Behalf Of Module', action: 'view' } },
      { label: 'On Behalf Of Approvals', link: '/time-off/on-behalf-of-approvals', permission: { feature: 'On Behalf Of Approvals Module', action: 'view' } },
      { label: 'Global-Permissions', link: '/time-off/global-permissions', permission: { feature: 'Global Permissions Module', action: 'view' } }
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



}