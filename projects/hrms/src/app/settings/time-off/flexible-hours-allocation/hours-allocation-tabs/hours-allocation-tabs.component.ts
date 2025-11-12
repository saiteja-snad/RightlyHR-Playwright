import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-hours-allocation-tabs',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './hours-allocation-tabs.component.html',
  styleUrl: './hours-allocation-tabs.component.scss'
})
export class HoursAllocationTabsComponent {
 navTabs: any[] = [
    {
      label: 'Work Hours Allocations',
      icon: '/settings-icon/active-allocation.png',
      route:
        '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation',
      permission: { feature: 'Work Hours Allocations Tab', action: 'view' },
    },
    {
      label: 'Allocation History',
      icon: '/settings-icon/allocation-history.png',
      route:
        '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation-view',
      permission: { feature: 'Work Hours Allocation History Tab', action: 'view' },
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
