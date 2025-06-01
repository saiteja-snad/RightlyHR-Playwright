import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StandardReportTabsComponent } from "../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";
import { AttandaceReportTabsComponent } from "../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { PolicyReportsTabsComponent } from "../../shared/reports-tabs/policy-reports-tabs/policy-reports-tabs.component";
@Component({
  selector: 'app-view-reports',
  imports: [RouterModule, StandardReportTabsComponent, AttandaceReportTabsComponent, PolicyReportsTabsComponent],
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.scss'
})

export class ViewReportsComponent {
  standardReports = MODULE_INFOS.STANDARD_REPORTS_MODULE_INFO;
  customReports = MODULE_INFOS.ATTENDANCE_REPORTS_MODULE_INFO;
  attendanceReports = MODULE_INFOS.SETTINGS_TIME_OFF_MODULE_INFO;
  monthlyAttendanceReports = MODULE_INFOS.MONTHLY_ATTENDANCE_REPORT_MODULE_INFO;
  policyReportModuleReports = MODULE_INFOS.MONTHLY_ATTENDANCE_REPORT_MODULE_INFO;
  teamLeaveBalance = MODULE_INFOS.TIME_OFF_LEAVES_TEAM_LEAVE_BALANCE_MODULE_INFO;
  teamLeaveSummary = MODULE_INFOS.TIME_OFF_LEAVES_TEAM_LEAVE_SUMMARY_MODULE_INFO;
  teamLeaveSummaryModuleInfo = MODULE_INFOS.TIME_OFF_LEAVES_ORG_LEAVE_BALANCE_MODULE_INFO;
}