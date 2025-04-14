import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-time-off-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './settings-time-off-tabs.component.html',
  styleUrl: './settings-time-off-tabs.component.scss'
})
export class SettingsTimeOffTabsComponent {
  navTabs: any[] = [
    { label: 'Flexible Leave Allocation', route: '/settings/timeoff-configurations/flexible-leave-allocation' },
    { label: 'Leave Category', route: '/settings/timeoff-configurations/leave-categoery' },
    { label: 'Leave Allocation', route: '/settings/timeoff-configurations/leave-allocation' },
    { label: 'Load Entitlements', route: '/settings/timeoff-configurations/load-entitlements' },
    { label: 'Attendance Eligibility Criteria', route: '/settings/timeoff-configurations/eligibility-criterias' },
 
  ];
  
}

