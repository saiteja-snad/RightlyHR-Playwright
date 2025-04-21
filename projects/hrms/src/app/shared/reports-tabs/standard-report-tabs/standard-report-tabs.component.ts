import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-standard-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './standard-report-tabs.component.html',
  styleUrl: './standard-report-tabs.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class StandardReportTabsComponent {
  navTabs = [
    { label: 'Employee Master Data', route: '/reports/standard-reports/employee-data' },
    { label: 'Job Location wise Data', route: '/reports/standard-reports/job-data' },
    { label: 'Branch Location Wise Data', route: '/reports/standard-reports/branch-data' },
    { label: 'Family Members Data', route: '/reports/standard-reports/family-data' },
  ];
}