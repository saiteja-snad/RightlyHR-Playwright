import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-rate-card-tabs',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './rate-card-tabs.component.html',
  styleUrl: './rate-card-tabs.component.scss'
})
export class RateCardTabsComponent {
  navTabs: any[] = [
    {
      label: 'Active',
      icon: '/settings-icon/Active.png',
      route:
        '/settings/employee-rate-card/rate-card/rate-card-active',
      permission: { feature: 'Rate Card Active Tab', action: 'view' },
    },
    {
      label: 'Inactive',
      icon: '/settings-icon/Inactive.png',
      route:
        '/settings/employee-rate-card/rate-card/rate-card-inactive',
      permission: { feature: 'Rate Card In-active Tab', action: 'view' },
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
