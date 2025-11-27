import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
@Component({
  selector: 'app-team-members-tabs',
  imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './team-members-tabs.component.html',
  styleUrl: './team-members-tabs.component.scss'
})

export class TeamMembersTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'My Team View', link: '/personalinfo/job/my-team-members',icon: '/my-info-icons/Team-icon.png', permission: { feature: 'Employee Info My Team Members Tab', action: 'view' } },
    { label: 'Team Overview', link: '/personalinfo/job/team-members', icon: '/my-info-icons/Team-icon.png',permission: { feature: 'Employee Info Team Members Tab', action: 'view' } },
  ];

  constructor(public rbac: RbacService,private router: Router,private accessNav: AccessNavigationService) { }

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