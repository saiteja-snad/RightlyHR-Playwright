
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
    { label: 'Leave Report', route: '/reports/attendence-reports/leave-report'},
    { label: 'Leave Summery Report', route: '/reports/attendence-reports/leave-summary-report'},
    { label: 'Comp off Report', route: '/reports/attendence-reports/compoff-report'}
  ];
}
