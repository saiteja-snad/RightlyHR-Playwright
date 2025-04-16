import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-settings-time-off-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './settings-time-off-tabs.component.html',
  styleUrl: './settings-time-off-tabs.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class SettingsTimeOffTabsComponent {
  navTabs: any[] = [
    { label: 'Leave Category', link: '/settings/timeoff-configurations/leave-categoery' },
    { label: 'Leave Allocation', link: '/settings/timeoff-configurations/leave-allocation' },
    { label: 'Flexible Leave Allocation', link: '/settings/timeoff-configurations/flexible-leave-allocation' },
    { label: 'Attendance Eligibility Criteria', link: '/settings/timeoff-configurations/eligibility-criterias' },
    { label: 'Load Entitlements', link: '/settings/timeoff-configurations/load-entitlements' },
  ];
}