import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StandardReportTabsComponent } from "../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";
import { AttandaceReportTabsComponent } from "../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { PolicyReportsTabsComponent } from "../../shared/reports-tabs/policy-reports-tabs/policy-reports-tabs.component";
import { RbacService } from '../../services/rbac.service';
import { AccordionModule } from 'primeng/accordion';
import { TimesheetReportTabsComponent } from '../../shared/reports-tabs/timesheet-report-tabs/timesheet-report-tabs.component';
import { HelpDeskReportTabsComponent } from '../../shared/reports-tabs/help-desk-report-tabs/help-desk-report-tabs.component';
import { ItSupportReportsTabsComponent } from '../../shared/reports-tabs/it-support-reports-tabs/it-support-reports-tabs.component';
import { TranslateModule } from '@ngx-translate/core';

const REPORTS_ACCORDION_KEY = 'reports_active_accordion';

@Component({
  selector: 'app-view-reports',
  imports: [RouterModule, StandardReportTabsComponent, AttandaceReportTabsComponent, PolicyReportsTabsComponent, AccordionModule, TimesheetReportTabsComponent, HelpDeskReportTabsComponent, ItSupportReportsTabsComponent, TranslateModule],
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ViewReportsComponent implements AfterViewInit {
  standardReports = MODULE_INFOS.STANDARD_REPORTS_MODULE_INFO;
  customReports = MODULE_INFOS.ATTENDANCE_REPORTS_MODULE_INFO;
  attendanceReports = MODULE_INFOS.SETTINGS_TIME_OFF_MODULE_INFO;
  monthlyAttendanceReports = MODULE_INFOS.MONTHLY_ATTENDANCE_REPORT_MODULE_INFO;
  policyReportModuleReports = MODULE_INFOS.POLICY_REPORTS_MODULE_INFO;
  teamLeaveBalance = MODULE_INFOS.TIME_OFF_LEAVES_TEAM_LEAVE_BALANCE_MODULE_INFO;
  teamLeaveSummary = MODULE_INFOS.TIME_OFF_LEAVES_TEAM_LEAVE_SUMMARY_MODULE_INFO;
  teamLeaveSummaryModuleInfo = MODULE_INFOS.TIME_OFF_LEAVES_ORG_LEAVE_BALANCE_MODULE_INFO;
  timesheetReports = MODULE_INFOS.SETTINGS_TIMESHEET_REPORT_MODULE_INFO;
  expenseReportsModuleInfo = MODULE_INFOS.EXPENSE_REPORTS_MODULE_INFO;
  helpDeskReports = MODULE_INFOS.HELP_DESK_REPORTS_MODULE_INFO;
  itsupportReports = MODULE_INFOS.ITSUPPORT_REPORTS_MODULE_INFO;

  activeAccordionValue: string = sessionStorage.getItem(REPORTS_ACCORDION_KEY) ?? '0';

  constructor(public rbac: RbacService) { }

  ngAfterViewInit() {
    setTimeout(() => {
      document.getElementById(`reports-panel-${this.activeAccordionValue}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  onAccordionChange(value: string | number | string[] | number[]) {
    if (value != null) {
      sessionStorage.setItem(REPORTS_ACCORDION_KEY, String(value));
    }
    this.activeAccordionValue = String(value);
  }
}
