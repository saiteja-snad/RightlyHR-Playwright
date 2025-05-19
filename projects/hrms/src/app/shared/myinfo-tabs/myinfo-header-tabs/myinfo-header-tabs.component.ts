import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-myinfo-header-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './myinfo-header-tabs.component.html',
  styleUrl: './myinfo-header-tabs.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class MyinfoHeaderTabsComponent {
 navTabs: any[] = [
    { label: 'Personal', link: '/myinfo/personal',permission: { feature: 'My Info Personal Tab', action: 'view' }, },
    { label: 'Job', link: '/myinfo/job',permission: { feature: 'My Info Job Tab', action: 'view' }, },
    { label: 'Documents', link: '/myinfo/documents',permission: { feature: 'My Info Documents Tab', action: 'view' }, },
    { label: 'Team Members', link: '/myinfo/team-members', permission: { feature: 'My Info Team Members Tab', action: 'view' }},
    // { label: 'Onboard Request', link: '/myinfo/onboarding-request', permission: { feature: 'My Info Onboard Request Tab', action: 'view' }},
  ];

  constructor(
    private rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) {}

  ngOnInit(): void {
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
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

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
}
