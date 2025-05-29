import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-new-user-invitation-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './new-user-invitation-tabs.component.html',
  styleUrl: './new-user-invitation-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class NewUserInvitationTabsComponent {
  navTabs: any[] = [
    { label: 'Active Employees', link: '/invite-user/active',icon:'/employee-data/active-employees-icon.png', permission: { feature: 'Dashboard Active Invite New User', action: 'view' } },
    { label: 'Active Trainees', link: '/invite-user/trainees',icon:'/employee-data/active-trainee-icon.png', permission: { feature: 'Dashboard Trainee Active Invite New User', action: 'view' } },
  ];

  constructor(private rbac: RbacService) { }

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
}