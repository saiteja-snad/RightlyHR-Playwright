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
    // { label: 'status', link: '' },
    // { label: 'Document', link: '' },
    // { label: 'Manage Shifts', link: '' },
    // { label: 'Manage Policies', link: '' },
    // { label: 'Manage Holidays', link: '' },
    // { label: 'Manage Weekends', link: '' },
    // { label: 'Expense Configurations', link: '' },
    // { label: 'Manage DST', link: '' },
    // { label: 'No Due Clearance', link: '' }
  ];
}