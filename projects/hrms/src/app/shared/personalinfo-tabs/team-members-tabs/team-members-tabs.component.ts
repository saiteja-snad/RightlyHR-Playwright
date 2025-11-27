import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-team-members-tabs',
  imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './team-members-tabs.component.html',
  styleUrl: './team-members-tabs.component.scss'
})

export class TeamMembersTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'My Team Members', link: '/personalinfo/job/team-members', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
    { label: 'Reporting Manager ', link: '/personalinfo/job/my-team-members', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
  ];

  constructor(public rbac: RbacService) { }

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
}