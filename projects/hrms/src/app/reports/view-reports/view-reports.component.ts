import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StandardReportTabsComponent } from "../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";
import { AttandaceReportTabsComponent } from "../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-view-reports',
  imports: [RouterModule, StandardReportTabsComponent, AttandaceReportTabsComponent],
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.scss'
})

export class ViewReportsComponent {
  standardReports = MODULE_INFOS.STANDARD_REPORTS_MODULE_INFO;
  customReports = MODULE_INFOS.ATTENDANCE_REPORTS_MODULE_INFO;
  attendanceReports = MODULE_INFOS.SETTINGS_TIME_OFF_MODULE_INFO;
  monthlyAttendanceReports = MODULE_INFOS.MONTHLY_ATTENDANCE_REPORT_MODULE_INFO;
}