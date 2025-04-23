import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-settings-job-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './settings-job-tabs.component.html',
  styleUrl: './settings-job-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsJobTabsComponent {
  navLinks = [
    { label: 'Job Role', route: '/settings/employee-fields/job/jobrole' , permission: { feature: 'Job Role', action: 'view' }},
    { label: 'Job Type', route: '/settings/employee-fields/job/jobtype' },
    { label: 'Probation Status', route: '/settings/employee-fields/job/probationstatus' },
    { label: 'Background Check Status', route: '/settings/employee-fields/job/backgroundcheck' },
    { label: 'Notice Period', route: '/settings/employee-fields/job/notice' },
    { label: 'Frequency', route: '/settings/employee-fields/job/frequency' },
    { label: 'Pay Type', route: '/settings/employee-fields/job/paytype' },
    { label: 'Overtime Eligibility', route: '/settings/employee-fields/job/overtime' },
    { label: 'Bussiness Area', route: '/settings/employee-fields/job/bussinesarea' },
    { label: 'Exit Reason', route: '/settings/employee-fields/job/termination' },
    { label: 'Eligible For Hire', route: '/settings/employee-fields/job/eligible-for-rehire' },
    { label: 'Department', route: '/settings/employee-fields/job/department' },
    { label: 'Team', route: '/settings/employee-fields/job/team' },
    { label: 'Grade Details', route: '/settings/employee-fields/job/grade' },
    { label: 'Compensation Reason', route: '/settings/employee-fields/job/compensation-reason' },
    { label: 'Location', route: '/settings/employee-fields/job/location' },
    { label: 'Sub Location', route: '/settings/employee-fields/job/sub-location' },
    { label: 'Pre Onboarding Documents', route: '/settings/employee-fields/job/pre-on-boarding-documents' },
    { label: 'Serving period', route: '/settings/employee-fields/job/serving-period' },
    { label: 'Probation Details', route: '/settings/employee-fields/job/probation-details' }
  ];
}
