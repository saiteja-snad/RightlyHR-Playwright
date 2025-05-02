
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-attandace-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './attandace-report-tabs.component.html',
  styleUrl: './attandace-report-tabs.component.scss'
})
export class AttandaceReportTabsComponent {
  navTabs = [
    { label: 'Leave Report', route: '/reports/attendence-reports/leave-report' },
    { label: 'Leave Summary Report', route: '/reports/attendence-reports/leave-summary-report' },
    { label: 'Comp Off Report', route: '/reports/attendence-reports/compoff-report' },
    { label: 'WFH Report', route: '/reports/attendence-reports/wfh-report' },
    { label: 'Absent Report', route: '/reports/attendence-reports/absent-report' },
    { label: 'Inactive Employee Report', route: '/reports/attendence-reports/inactive-employee-report' },
    { label: 'Yearly Summary Report', route: '/reports/attendence-reports/yearly-summary-report' },
    // { label: 'Permission Report', route: '/reports/attendence-reports/permission-report' },
    // { label: 'Regularization Report', route: '/reports/attendence-reports/regularization-report' },
  ];
}
