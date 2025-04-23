import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-policies-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-policies-tabs.component.html',
  styleUrl: './settings-manage-policies-tabs.component.scss'
})

export class SettingsManagePoliciesTabsComponent {

  public navLinks: any[] = [];

  constructor(public rbac: RbacService) {
    this.navLinks = this.allNavLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
  }

  allNavLinks = [
    {
      label: 'Pending For Submit',
      route: '/settings/employee-fields/manage-policies/pending-for-submit',
      permission: { feature: 'Pending For Policies Submit', action: 'view' }
    },
    {
      label: 'Published Policies',
      route: '/settings/employee-fields/manage-policies/published-policies',
      permission: { feature: 'Published Policies', action: 'view' }
    }
  ];
}
