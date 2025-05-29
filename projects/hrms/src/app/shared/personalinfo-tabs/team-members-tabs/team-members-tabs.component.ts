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
    { label: 'Reporting Manager Change', link: '/personalinfo/team/team-members', permission: { feature: 'Employee Info Reporting Manager Tab', action: 'view' } },
    { label: 'Team Manager Change', link: '/personalinfo/team/team-manger-members', permission: { feature: 'Employee Info Team Managers Tab', action: 'view' } },
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