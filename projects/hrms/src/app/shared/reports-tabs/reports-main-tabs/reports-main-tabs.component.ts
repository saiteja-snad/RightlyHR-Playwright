import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-reports-main-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './reports-main-tabs.component.html',
  styleUrl: './reports-main-tabs.component.scss'
})
export class ReportsMainTabsComponent {
  navTabs: any[] = [
    { label: 'Standard Reports', link: '/reports/standard-reports/employee-data' },
    { label: 'Custom Reports', link: '/reports/custom-reports' },
    { label: 'Attendance Reports', link: '/settings/timeoff-configurations' },
    { label: 'Monthly Attendance Report', link: '/reports/monthly-attandance-reports' },
  ];
}
