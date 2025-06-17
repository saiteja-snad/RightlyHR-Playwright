import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-reports-header',
  imports: [CommonModule, RouterModule],
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
      this.componentname = 'Employee Master Data';
    }
    else if (this.router.url === '/reports/standard-reports/job-data') {
      this.componentname = 'Job Location Wise Data';
    }
    else if (this.router.url === '/reports/standard-reports/branch-data') {
      this.componentname = 'Branch Location Wise Data';
    }
    else if (this.router.url === '/reports/standard-reports/family-data') {
      this.componentname = 'Family Members Data';
    }
    else if (this.router.url === '/reports/attendence-reports/leave-report') {
      this.componentname = 'Leave Report';
    }
    else if (this.router.url === '/reports/attendence-reports/leave-summary-report') {
      this.componentname = 'Leave Summary Report';
    }
    else if (this.router.url === '/reports/attendence-reports/compoff-report') {
      this.componentname = 'Compoff Report';
    }
    else if (this.router.url === '/reports/attendence-reports/wfh-report') {
      this.componentname = 'WFH Report';
    }
    else if (this.router.url === '/reports/attendence-reports/inactive-employee-report') {
      this.componentname = 'Inactive Employee Report';
    }
    else if (this.router.url === '/reports/attendence-reports/yearly-summary-report') {
      this.componentname = 'Yearly Summary Report';
    }
    else if (this.router.url === '/reports/attendence-reports/permission-report') {
      this.componentname = 'Permission Report';
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
  }
}