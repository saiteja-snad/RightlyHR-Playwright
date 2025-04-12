import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-settings-job-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './settings-job-tabs.component.html',
  styleUrl: './settings-job-tabs.component.scss'
})

export class SettingsJobTabsComponent {
  navLinks = [
    { label: 'Job Role', route: '/settings/employee-fields/job/jobrole' },
    { label: 'Job Type', route: '/settings/employee-fields/personal/gender' },
    { label: 'Probation Status', route: '/settings/employee-fields/personal/gender' },
    { label: 'Background Check Status', route: '/settings/employee-fields/personal/maritalstatus' },
    { label: 'Notice Period', route: '/settings/employee-fields/personal/maritalstatus' },
    { label: 'Frequency', route: '/settings/employee-fields/personal/visatype' },
    { label: 'Pay Type', route: '/settings/employee-fields/personal/identitytype' },
    { label: 'Overtime Eligibility', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Bussiness Area', route: '/settings/employee-fields/personal/' },
    { label: 'Exit Reason', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Eligible For Hire', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Department', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Team', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Grade Details', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Compensation Reason', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Location', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Sub Location', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Pre Onboarding Documents', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Serving period', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Consultancy', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Add Interview Rounds', route: '/settings/employee-fields/personal/relationship' },
    { label: 'Probation Details', route: '/settings/employee-fields/personal/relationship' }
  ];
}
