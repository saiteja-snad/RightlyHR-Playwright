import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-standard-report-tabs',
  imports: [RouterModule,CommonModule],
  templateUrl: './standard-report-tabs.component.html',
  styleUrl: './standard-report-tabs.component.scss'
})
export class StandardReportTabsComponent {
  navLinks = [
    { label: 'Employee Master Data', route: '/reports/standard-reports/employee-data' },
    { label: 'Job Location wise Data', route: '/reports/standard-reports/job-data' },
    { label: 'branch Location Wise Data', route: '/reports/standard-reports/branch-data' },
    { label: 'Family Members Data', route: '/reports/standard-reports/family-data' },
  ];
}