import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-settings-job-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './settings-job-tabs.component.html',
  styleUrl: './settings-job-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsJobTabsComponent implements OnInit {
  
  public navLinks: any[] = [];
  public defaultRoute: string = '';
  
  constructor(public rbac: RbacService) {
    
  }

  ngOnInit(): void {
    this.navLinks = this.allNavLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );

    if (this.navLinks.length > 0) {
      this.defaultRoute = this.navLinks[0].route;
    }
  }

  allNavLinks = [
    { label: 'Job Role', route: '/settings/employee-fields/job/jobrole' , permission: { feature: 'Job Role', action: 'view' }},
    { label: 'Job Type', route: '/settings/employee-fields/job/jobtype', permission: { feature: 'Job Type', action: 'view' } },
    { label: 'Probation Status', route: '/settings/employee-fields/job/probationstatus', permission: { feature: 'Probation Status', action: 'view' } },
    { label: 'Background Check Status', route: '/settings/employee-fields/job/backgroundcheck', permission: { feature: 'Background check Status', action: 'view' } },
    { label: 'Notice Period', route: '/settings/employee-fields/job/notice', permission: { feature: 'Notice Period', action: 'view' } },    
    { label: 'Frequency', route: '/settings/employee-fields/job/frequency', permission: { feature: 'Frequency', action: 'view' } },
    { label: 'Pay Type', route: '/settings/employee-fields/job/paytype', permission: { feature: 'Paytype', action: 'view' } },
    { label: 'Overtime Eligibility', route: '/settings/employee-fields/job/overtime', permission: { feature: 'Overtime Eligibility', action: 'view' } },
    { label: 'Bussiness Area', route: '/settings/employee-fields/job/bussinesarea', permission: { feature: 'Business Area', action: 'view' } },
    { label: 'Exit Reason', route: '/settings/employee-fields/job/termination', permission: { feature: 'Termination Reason', action: 'view' } },
    { label: 'Eligible For Hire', route: '/settings/employee-fields/job/eligible-for-rehire', permission: { feature: 'Eligible For Rehire', action: 'view' } },
    { label: 'Department', route: '/settings/employee-fields/job/department', permission: { feature: 'Department', action: 'view' } },
    { label: 'Team', route: '/settings/employee-fields/job/team', permission: { feature: 'Team', action: 'view' } },
    { label: 'Grade Details', route: '/settings/employee-fields/job/grade', permission: { feature: 'Grade Details', action: 'view' } },
    { label: 'Compensation Reason', route: '/settings/employee-fields/job/compensation-reason', permission: { feature: 'Compensation Reason', action: 'view' } },
    { label: 'Location', route: '/settings/employee-fields/job/location', permission: { feature: 'Location', action: 'view' } },
    { label: 'Sub Location', route: '/settings/employee-fields/job/sub-location', permission: { feature: 'Sub Location', action: 'view' } },
    { label: 'Pre Onboarding Documents', route: '/settings/employee-fields/job/pre-on-boarding-documents', permission: { feature: 'Pre Onboard Documents', action: 'view' } },
    { label: 'Serving period', route: '/settings/employee-fields/job/serving-period', permission: { feature: 'Serving Period', action: 'view' } },
    { label: 'Probation Details', route: '/settings/employee-fields/job/probation-details', permission: { feature: 'Probation Details', action: 'view' } },
    { label: 'Interview Round', route: '/settings/employee-fields/job/interview-round', permission: { feature: 'Interview Round', action: 'view' }},

  ];
}
