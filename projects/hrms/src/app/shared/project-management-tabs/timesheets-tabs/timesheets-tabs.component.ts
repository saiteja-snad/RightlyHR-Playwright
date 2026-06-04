import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}

@Component({
  selector: 'app-timesheets-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule, DragDropModule, TabsDndDirective],
  templateUrl: './timesheets-tabs.component.html',
  styleUrl: './timesheets-tabs.component.scss'
})

export class TimesheetsTabsComponent {
  readonly tabsKey = 'project-management-timesheets-tabs';
  tabs: StatusTab[] = [];
  navTabs: StatusTab[] = [
    {
      tabId: '/project-management/timesheet/mytimesheet',
      label: 'My Timesheets', link: '/project-management/timesheet/mytimesheet', icon: '/icons/my-timesheet-icon.png',
      permission: { feature: 'Time Sheet', action: 'view' }
    },
    {
      tabId: '/project-management/timesheet/mysummary',
      label: 'My Summary', link: '/project-management/timesheet/mysummary', icon: '/project-mangement-icons/timesheet-my-summary.svg',
      permission: { feature: 'My Summary', action: 'view' }
    },
    {
      tabId: '/project-management/timesheet/teamtimesheet',
      label: 'Team Timesheets', link: '/project-management/timesheet/teamtimesheet', icon: '/icons/team-timesheet-icon.png',
      permission: { feature: 'Team Time Sheet', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService, private menuOrderService: MenuOrderService) { }

  ngOnInit(): void {
    this.rebuildTabs();
  }

  private rebuildTabs(): void {
    const filtered = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
        this.tabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      filtered,
      (t) => t.tabId
    );

    const baseUrl = '/project-management/timesheet';
    if (this.router.url === baseUrl && this.tabs.length > 0) {
      this.router.navigateByUrl(this.tabs[0].link);
    }
    const isAllowed = this.tabs.some(t => t.link === this.router.url);
    if (!isAllowed && this.router.url.startsWith(baseUrl) && this.tabs.length > 0) {
      this.router.navigateByUrl(this.tabs[0].link);
    }
  }
    navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Remove query params

    // For My Timesheets tab, include mysummary page
    if (link === '/project-management/timesheet/mytimesheet') {
      return currentUrl === link
       || currentUrl === '/project-management/timesheet/bulk-upload'
        || currentUrl === '/project-management/timesheet/historylog'
        || currentUrl === '/project-management/timesheet/export-history'
        || currentUrl === '/project-management/timesheet/bulk-export';
      // return currentUrl === link;
    }

    // For Team Timesheets tab, include summary page
    if (link === '/project-management/timesheet/teamtimesheet') {
      return currentUrl === link || currentUrl === '/project-management/timesheet/summary'||currentUrl === '/project-management/timesheet/resourcesummary';
    }
    // For Team Timesheets tab, include summary page
    if (link === '/project-management/timesheet/teamtimesheet') {
      return currentUrl === link || currentUrl === '/project-management/timesheet/resourcesummary';
    }

    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

   trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }
}
