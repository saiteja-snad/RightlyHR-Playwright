import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-info-team-numbers-tab',
  imports: [CommonModule,TabsModule, RouterModule],
  templateUrl: './my-info-team-numbers-tab.component.html',
  styleUrl: './my-info-team-numbers-tab.component.scss'
})
export class MyInfoTeamNumbersTabComponent {
   filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'My Team Members', link: '/myinfo/job/team-members', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
    { label: 'Reporting Manager ', link: '/myinfo/job/my-team-members', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
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
