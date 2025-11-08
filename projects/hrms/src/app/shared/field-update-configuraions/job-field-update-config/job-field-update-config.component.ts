import { Component, OnInit } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-field-update-config',
  imports: [RouterModule, CommonModule],
  templateUrl: './job-field-update-config.component.html',
  styleUrl: './job-field-update-config.component.scss'
})
export class JobFieldUpdateConfigComponent implements OnInit {
  filteredTabs: any[] = [];

  allNavLinks = [    
    { label: 'Certifications', route: '/settings/employee-fields-update-configurations/job/certifications', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Employment History', route: '/settings/employee-fields-update-configurations/job/employment-history', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Job Info', route: '/settings/employee-fields-update-configurations/job/job-info', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Assigned Tasks', route: '/settings/employee-fields-update-configurations/job/assigned-tasks', permission: { feature: 'Salutation', action: 'view' } }, 
    // { label: 'Contract Info', route: '/settings/employee-fields-update-configurations/job/contract-info', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Desk Info', route: '/settings/employee-fields-update-configurations/job/desk-info', permission: { feature: 'Salutation', action: 'view' } },    
    // { label: 'No Due Clearance Info', route: '/settings/employee-fields-update-configurations/job/no-due-clearance-info', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Onboarding Info', route: '/settings/employee-fields-update-configurations/job/onboarding-info', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Pre Onboarding Info', route: '/settings/employee-fields-update-configurations/job/pre-onboarding-info', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Separation Request', route: '/settings/employee-fields-update-configurations/job/separation-request', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Team Members', route: '/settings/employee-fields-update-configurations/job/team-members', permission: { feature: 'Salutation', action: 'view' } },
    // { label: 'Compensations', route: '/settings/employee-fields-update-configurations/job/compensations', permission: { feature: 'Salutation', action: 'view' } },
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.allNavLinks.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}
