import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-reports-header',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './reports-header.component.html',
  styleUrl: './reports-header.component.scss'
})
export class ReportsHeaderComponent implements OnInit {
  componentname: string = '';

  constructor(public readonly router: Router) { }

  ngOnInit(): void {
    this.ComponentnameDisplay();
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ComponentnameDisplay() {
    if (this.router.url === '/reports/standard-reports/employee-data') {
      this.componentname = 'Employee Overview Report';
    }
    else if (this.router.url === '/reports/standard-reports/job-data') {
      this.componentname = 'Job Location Report';
    }
    else if (this.router.url === '/reports/standard-reports/branch-data') {
      this.componentname = 'Branch-Wise Employee Report';
    }
    else if (this.router.url === '/reports/standard-reports/family-data') {
      this.componentname = 'Family Details Report';
    }
    else if (this.router.url === '/reports/attendence-reports/leave-report') {
      this.componentname = 'Leave Report';
    }
    else if (this.router.url === '/reports/attendence-reports/leave-summary-report') {
      this.componentname = 'Leave Summary Report';
    }
    else if (this.router.url === '/reports/attendence-reports/compoff-report') {
      this.componentname = 'Comp Off Report';
    }
    else if (this.router.url === '/reports/attendence-reports/wfh-report') {
      this.componentname = 'WFH Report';
    }
    else if (this.router.url === '/reports/attendence-reports/inactive-employee-report') {
      this.componentname = 'Inactive Employee Leave Summary Report';
    }
    else if (this.router.url === '/reports/attendence-reports/yearly-summary-report') {
      this.componentname = 'Yearly Summary Report';
    }
    else if (this.router.url === '/reports/attendence-reports/permission-report') {
      this.componentname = 'Permission Report';
    }
    else if (this.router.url === '/reports/attendence-reports/exit-feedback-report' || this.router.url === '/reports/attendence-reports/employee-exit-report') {
      this.componentname = 'Employee Exit Report';
    }
    else if (this.router.url === '/reports/attendence-reports/regularization-report') {
      this.componentname = 'Regularization Report';
    }
    else if (this.router.url === '/reports/custom-reports') {
      this.componentname = 'Custom Reports';
    }
    else if (this.router.url === '/reports/monthly-attandance-reports') {
      this.componentname = 'Monthly Attendance Report';
    }
    else if (this.router.url === '/reports/team-leave-balance') {
      this.componentname = 'Team Leave Balance';
    }
    else if (this.router.url === '/reports/team-leave-summary') {
      this.componentname = 'Team Leave Summary';
    }
    else if (this.router.url === '/reports/org-leave-balance') {
      this.componentname = 'Org Leave Balance';
    }

    else if (this.router.url === '/reports/timesheet-reports/my-timesheet-report') {
      this.componentname = 'My Timesheet Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/timesheet-summary-monthly-report') {
      this.componentname = 'Timesheet Summary Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/team-timesheet-report') {
      this.componentname = 'Team Timesheet Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/pending-approval-status-report') {
      this.componentname = 'Pending Approval Status Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/project-effort-report') {
      this.componentname = 'Project Effort Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/utilization-report') {
      this.componentname = 'Utilization Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/resource-availability-report') {
      this.componentname = 'Resource Availability Report';
    }
     else if (this.router.url === '/reports/timesheet-reports/attendance-vs-timesheet-report') {
      this.componentname = 'Attendance vs Timesheet Report';
     }
    else if (this.router.url === '/reports/attendence-reports/remotelogin-report') {
      this.componentname = 'Remote Login Report';
    }
    else if (this.router.url === '/reports/attendence-reports/remotelogin-report') {
      this.componentname = 'Remote Login Report';
    }
    else if (this.router.url === '/reports/attendence-reports/extraloghour-report') {
      this.componentname = 'Extra Log Hours Report';
    }
    else if(this.router.url === '/reports/expense-reports'){
      this.componentname = 'Expense Report'

    }
    else if(this.router.url === '/reports/attendence-reports/leave-carryforward-report'){
      this.componentname = 'Leave Carry Forward & Encashment Report'
    }
    else if (this.router.url === '/reports/timesheet-reports/consolidated-timesheet-summary') {
      this.componentname = 'Consolidated Timesheet Summary Report';
    }

    else if (this.router.url === '/reports/itsupport-reports/itsupport-detailed-report') {
      this.componentname = 'IT Support Detailed Report';
    }
    else if (this.router.url === '/reports/itsupport-reports/itsupport-summary-report') {
      this.componentname = 'IT Support Summary Report';
    }
  }
}
