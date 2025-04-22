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
    { label: 'Standard Reports', link: '/reports/standard-reports', permission: { feature: 'Standard Reports', action: 'view'}},
    { label: 'Custom Reports', link: '/reports/custom-reports' ,permission: { feature: 'Custom Reports', action: 'view'}},
    { label: 'Attendance Reports',link: '/reports/attendence-reports', permission: { feature: 'Attendance Reports', action: 'view' }},
    { label: 'Monthly Attendance Report', link: '/reports/monthly-attandance-reports' ,permission: { feature: 'Monthly Attandance Report', action: 'view'}},
  ];
}