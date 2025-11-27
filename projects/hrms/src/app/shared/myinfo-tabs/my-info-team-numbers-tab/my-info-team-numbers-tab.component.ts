import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { Router, RouterModule } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-my-info-team-numbers-tab',
  imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './my-info-team-numbers-tab.component.html',
  styleUrl: './my-info-team-numbers-tab.component.scss'
})
export class MyInfoTeamNumbersTabComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'Reports to you', link: '/myinfo/job/my-team-members', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
    { label: 'Works with you', link: '/myinfo/job/team-members', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
  ];

  constructor(public rbac: RbacService, private router: Router, private accessNav: AccessNavigationService) { }
  
  ngOnInit(): void {
    // this.filterTabsByRbac();
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
    return this.router.url.includes(link);
  }
}