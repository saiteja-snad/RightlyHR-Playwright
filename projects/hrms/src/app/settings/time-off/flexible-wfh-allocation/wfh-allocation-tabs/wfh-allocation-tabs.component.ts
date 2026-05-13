import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { RbacService } from '../../../../services/rbac.service';
@Component({
  selector: 'app-wfh-allocation-tabs',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './wfh-allocation-tabs.component.html',
  styleUrl: './wfh-allocation-tabs.component.scss',
})

export class WfhAllocationTabsComponent implements OnInit {
  navTabs: any[] = [
    {
      label: 'WFH Allocations',
      icon: '/settings-icon/active-allocation.png',
      route:
        '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation',
      permission: { feature: 'Active Allocations Tab', action: 'view' },
    },
        {
      label: 'Allow Multi Date Range',
      icon: '/settings-icon/allocation-history.png',
      route:
        '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allow-multi-date-range',
      permission: { feature: 'Allow Multi Date Range Tab', action: 'view' },
    },
        {
      label: 'Allocation History',
      icon: '/settings-icon/allow-date-range.png',
      route:
        '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation-view',
      permission: { feature: 'Allocation History Tab', action: 'view' },
    },
  ];

  constructor(private rbac: RbacService, private router: Router, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }
}
