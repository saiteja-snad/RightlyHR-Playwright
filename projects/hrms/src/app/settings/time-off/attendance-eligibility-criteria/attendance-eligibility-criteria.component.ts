import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-attendance-eligibility-criteria',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './attendance-eligibility-criteria.component.html',
  styleUrl: './attendance-eligibility-criteria.component.scss'
})
export class AttendanceEligibilityCriteriaComponent {
  navLinks = [
    { label: 'Comp Off Entitlement Criteria', route: '/settings/timeoff-configurations/eligibility-criterias/comp-off' },
    { label: 'WFH Entitlement Criteria', route: '/settings/timeoff-configurations/eligibility-criterias/wfh' },
    { label: 'Permissions', route: '/settings/timeoff-configurations/eligibility-criterias/permissions' },
   
  ];
}
