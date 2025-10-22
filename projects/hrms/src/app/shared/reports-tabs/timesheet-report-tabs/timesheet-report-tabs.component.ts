import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-timesheet-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './timesheet-report-tabs.component.html',
  styleUrl: './timesheet-report-tabs.component.scss'
})
export class TimesheetReportTabsComponent {
 filteredTabs: any[] = [];
  navTabs = [
    {
      label: 'My Timesheet Report',
      route: '/reports/timesheet-reports/my-timesheet-report',
      icon: '/reports-icons/my-timesheet-report.png',
      description: MODULE_INFOS.MY_TIMESHEET_REPORTS_MODULE_INFO,
      permission: { feature: 'My Timesheet Report', action: 'view' }
    },
    {
      label: 'Timesheet Summary Monthly Report',
      route: '/reports/timesheet-reports/timesheet-summary-monthly-report',
      icon: '/reports-icons/timesheet-summary-monthly-report.png',
      description: MODULE_INFOS.ATTENDANCE_TIMESHEET_SUMMARY_MONTHLY_REPORTS_MODULE_INFO,
      permission: { feature: 'Timesheet Summary Monthly Report', action: 'view' }
    },
    {
      label: 'Team Timesheet Report(Manager)',
      route: '/reports/timesheet-reports/team-timesheet-report',
      icon: '/reports-icons/team-timesheet-report.png',
      description: MODULE_INFOS.TEAM_TIMESHEET_REPORTS_MODULE_INFO,
      permission: { feature: 'Team Timesheet Report', action: 'view' }
    },
    {
      label: 'Pending Approval Status Report',
      route: '/reports/timesheet-reports/pending-approval-status-report',
      icon: '/reports-icons/pending-approval-status-report.png',
      description: MODULE_INFOS.PENDING_APPROVAL_REPORTS_MODULE_INFO,
      permission: { feature: 'Pending Approval Status Report', action: 'view' }
    },
    // { label: 'Absent Report', route: '/reports/attendence-reports/absent-report',permission: { feature: 'Absent Report', action: 'view' } },
    {
      label: 'Project Effort Report',
      route: '/reports/timesheet-reports/project-efforts-report',
      icon: '/reports-icons/project-efforts-report.png',
      description: MODULE_INFOS.PROJECT_EFFORT_REPORTS_MODULE_INFO,
      permission: { feature: 'Project Effort Report', action: 'view' }
    },
    {
      label: 'Utilization Report',
      route: '/reports/timesheet-reports/utilization-report',
      icon: '/reports-icons/utilization-report.png',
      description: MODULE_INFOS.UTILIZATION_REPORTS_MODULE_INFO,
      permission: { feature: 'Utilization Report', action: 'view' }
    },
    {
      label: 'Resource Availability Report',
      route: '/reports/timesheet-reports/resource-availability-report',
      icon: '/reports-icons/resource-availability-report.png',
      description: MODULE_INFOS.RESOURCE_AVAILABILITY_REPORTS_MODULE_INFO,
      permission: { feature: 'Resource Availability Report', action: 'view' }
    },
    {
      label: 'Attendance vs Timesheet Report',
      route: '/reports/timesheet-reports/attendance-vs-timesheet-report',
      icon: '/reports-icons/attendance-vs-timesheet-report.png',
      description: MODULE_INFOS.ATTENDANCE_VS_TIMESHEET_REPORTS_MODULE_INFO,
      permission: { feature: 'Attendance vs Timesheet Report', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}
