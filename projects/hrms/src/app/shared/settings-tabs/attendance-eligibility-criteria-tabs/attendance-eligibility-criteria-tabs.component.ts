import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-attendance-eligibility-criteria-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './attendance-eligibility-criteria-tabs.component.html',
  styleUrl: './attendance-eligibility-criteria-tabs.component.scss'
})
export class AttendanceEligibilityCriteriaTabsComponent {

  public navLinks: any[] = [];

  constructor(public rbac: RbacService) {
    this.navLinks = this.allLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
  }

  allLinks = [
    { label: 'Comp Off Entitlement Criteria',route: '/settings/timeoff-configurations/eligibility-criterias/comp-off',permission: { feature: 'Comp Off Entitlement Tab', action: 'view' } },
    { label: 'WFH Entitlement Criteria',route: '/settings/timeoff-configurations/eligibility-criterias/wfh',permission: { feature: 'WFH Entitlement Tab', action: 'view' } },
    { label: 'Permissions',route: '/settings/timeoff-configurations/eligibility-criterias/permissions',permission: { feature: 'Attendance Eligibility Permissions Tab', action: 'view' } },
    { label: 'Permissions Eligibility Criteria',route: '/settings/timeoff-configurations/eligibility-criterias/permissions-eligibility-criteria',permission: { feature: 'Permission Elgibility Tab', action: 'view' } },
    { label: 'Global Permissions',route: '/settings/timeoff-configurations/eligibility-criterias/global-permissions',permission: { feature: 'Eligibility Global Permissions Tab', action: 'view' } },
    { label: 'Attendance Regularization Types',route: '/settings/timeoff-configurations/eligibility-criterias/attendance-regularization-types',permission: { feature: 'Attendance Regularization Tab', action: 'view' } },
    { label: 'Attendance Regularization Eligibility Criteria',route: '/settings/timeoff-configurations/eligibility-criterias/attendance-regularization-eligibility-criteria',permission: { feature: 'Attendance Regularization Eligibility Tab', action: 'view' } }
  ];
}
