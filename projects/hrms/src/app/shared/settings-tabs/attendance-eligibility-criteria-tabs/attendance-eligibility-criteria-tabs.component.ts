import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-attendance-eligibility-criteria-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './attendance-eligibility-criteria-tabs.component.html',
  styleUrl: './attendance-eligibility-criteria-tabs.component.scss'
})
export class AttendanceEligibilityCriteriaTabsComponent {
  navLinks = [
    { label: 'Comp Off Entitlement Criteria', route: '/settings/timeoff-configurations/eligibility-criterias/comp-off' },
    { label: 'WFH Entitlement Criteria', route: '/settings/timeoff-configurations/eligibility-criterias/wfh' },
    { label: 'Permissions', route: '/settings/timeoff-configurations/eligibility-criterias/permissions' },
    { label: 'Permissions Eligibilty Criteria', route: '/settings/timeoff-configurations/eligibility-criterias/permissions-eligibility-criteria' },
  ];
}
