import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-employee-fields-module-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './settings-employee-fields-module-tabs.component.html',
  styleUrl: './settings-employee-fields-module-tabs.component.scss'
})

export class SettingsEmployeeFieldsModuleTabsComponent {
  navTabs: any[] = [
    { label: 'Personal', link: '/settings/employee-fields/personal' },
    { label: 'Job', link: '/settings/employee-fields/job' },
    { label: 'status', link: '/settings/employee-fields/job' },
    { label: 'Document', link: '/settings/employee-fields/job' },
    { label: 'Manage Shifts', link: '/settings/employee-fields/manage-shifts' },
    { label: 'Manage Policies', link: '/settings/employee-fields/manage-policies' },
    { label: 'Manage Holidays', link: '/settings/employee-fields/manage-holidays' },
    { label: 'Manage Weekends', link: '/settings/employee-fields/job' },
    { label: 'Expense Configurations', link: '/settings/employee-fields/expenes' },
    { label: 'Manage DST', link: '/settings/employee-fields/job' },
    { label: 'No Due Clearance', link: '/settings/employee-fields/no-due-clearnce' }
  ];
}