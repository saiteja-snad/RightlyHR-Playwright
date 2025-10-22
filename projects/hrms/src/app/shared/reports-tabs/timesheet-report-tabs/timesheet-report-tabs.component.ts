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
      icon: '/time-off-icon/leaves-icon.png',
      description: MODULE_INFOS.MY_TIMESHEET_REPORTS_MODULE_INFO,
      permission: { feature: 'My Timesheet Report', action: 'view' }
    },
    {
      label: 'Timesheet Summary Monthly Report',
      route: '/reports/timesheet-reports/timesheet-summary-monthly-report',
      icon: '/time-off-icon/Leave-summary-report-icon.png',
      description: MODULE_INFOS.ATTENDANCE_TIMESHEET_SUMMARY_MONTHLY_REPORTS_MODULE_INFO,
      permission: { feature: 'Timesheet Summary Monthly Report', action: 'view' }
    },
    {
      label: 'Team Timesheet Report(Manager)',
      route: '/reports/timesheet-reports/team-timesheet-report',
      icon: '/time-off-icon/comp-off.png',
      description: MODULE_INFOS.TEAM_TIMESHEET_REPORTS_MODULE_INFO,
      permission: { feature: 'Team Timesheet Report', action: 'view' }
    },
    {
      label: 'Pending Approval Status Report',
      route: '/reports/timesheet-reports/pending-approval-status-report',
      icon: '/time-off-icon/WFH-icon.png',
      description: MODULE_INFOS.PENDING_APPROVAL_REPORTS_MODULE_INFO,
      permission: { feature: 'Pending Approval Status Report', action: 'view' }
    },
    // { label: 'Absent Report', route: '/reports/attendence-reports/absent-report',permission: { feature: 'Absent Report', action: 'view' } },
    {
      label: 'Project Effort Report',
      route: '/reports/timesheet-reports/project-effort-report',
      icon: '/time-off-icon/Inactive-employee-report-icon.png',
      description: MODULE_INFOS.PROJECT_EFFORT_REPORTS_MODULE_INFO,
      permission: { feature: 'Project Effort Report', action: 'view' }
    },
    {
      label: 'Utilization Report',
      route: '/reports/timesheet-reports/utilization-report',
      icon: '/time-off-icon/Yearly-summary-report-icon.png',
      description: MODULE_INFOS.UTILIZATION_REPORTS_MODULE_INFO,
      permission: { feature: 'Utilization Report', action: 'view' }
    },
    {
      label: 'Resource Availability Report',
      route: '/reports/timesheet-reports/resource-availability-report',
      icon: '/time-off-icon/permissions-icon.png',
      description: MODULE_INFOS.RESOURCE_AVAILABILITY_REPORTS_MODULE_INFO,
      permission: { feature: 'Resource Availability Report', action: 'view' }
    },
    {
      label: 'Attendance vs Timesheet Report',
      route: '/reports/timesheet-reports/attendance-vs-timesheet-report',
      icon: '/time-off-icon/regularization-icon.png',
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
