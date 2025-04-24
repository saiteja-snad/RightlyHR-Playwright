import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-holidays-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-holidays-tabs.component.html',
  styleUrl: './settings-manage-holidays-tabs.component.scss'
})
export class SettingsManageHolidaysTabsComponent {

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
      route: '/settings/employee-fields/manage-holidays/pending-for-submit',
      permission: { feature: 'Pending For Holidays Submit', action: 'view' }
    },
    {
      label: 'Published Holidays',
      route: '/settings/employee-fields/manage-holidays/published-holidays',
      permission: { feature: 'Published Holidays', action: 'view' }
    }
  ];
}
