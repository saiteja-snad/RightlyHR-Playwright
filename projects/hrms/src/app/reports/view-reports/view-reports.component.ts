import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StandardReportTabsComponent } from "../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";
import { AttandaceReportTabsComponent } from "../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import { CustomTabsReportsComponent } from "../../shared/reports-tabs/custom-tabs-reports/custom-tabs-reports.component";
import { MonthlyTabsReportsComponent } from "../../shared/reports-tabs/monthly-tabs-reports/monthly-tabs-reports.component";

@Component({
  selector: 'app-view-reports',
  imports: [RouterModule, StandardReportTabsComponent, AttandaceReportTabsComponent, CustomTabsReportsComponent, MonthlyTabsReportsComponent],
  templateUrl: './view-reports.component.html',
  styleUrl: './view-reports.component.scss'
})
export class ViewReportsComponent {

}
