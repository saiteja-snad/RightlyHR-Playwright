
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-attandace-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './attandace-report-tabs.component.html',
  styleUrl: './attandace-report-tabs.component.scss'
})

export class AttandaceReportTabsComponent {
  filteredTabs: any[] = [];
  navTabs = [
    {
      label: 'Leave Report',
      route: '/reports/attendence-reports/leave-report',
      icon: '/time-off-icon/leaves-icon.png',
      description: MODULE_INFOS.ATTENDANCE_LEAVE_REPORTS_MODULE_INFO,
      permission: { feature: 'Leave Report', action: 'view' }
    },
    {
      label: 'Leave Summary Report',
      route: '/reports/attendence-reports/leave-summary-report',
      icon: '/time-off-icon/Leave-summary-report-icon.png',
      description: MODULE_INFOS.ATTENDANCE_LEAVE_SUMMARY_REPORTS_MODULE_INFO,
      permission: { feature: 'Leave Summary Report', action: 'view' }
    },
    {
      label: 'Comp Off Report',
      route: '/reports/attendence-reports/compoff-report',
      icon: '/time-off-icon/comp-off.png',
      description: MODULE_INFOS.ATTENDANCE_COMP_OFF_REPORTS_MODULE_INFO,
      permission: { feature: 'Comp Off Report', action: 'view' }
    },
    {
      label: 'WFH Report',
      route: '/reports/attendence-reports/wfh-report',
      icon: '/time-off-icon/WFH-icon.png',
      description: MODULE_INFOS.ATTENDANCE_WFH_REPORTS_MODULE_INFO,
      permission: { feature: 'WFH Report', action: 'view' }
    },
    // { label: 'Absent Report', route: '/reports/attendence-reports/absent-report',permission: { feature: 'Absent Report', action: 'view' } },
    {
      label: 'Inactive Employee Report',
      route: '/reports/attendence-reports/inactive-employee-report',
      icon: '/time-off-icon/Inactive-employee-report-icon.png',
      description: MODULE_INFOS.ATTENDANCE_INACTIVE_EMPLOYEE_REPORTS_MODULE_INFO,
      permission: { feature: 'Inactive Empolyee Report', action: 'view' }
    },
    {
      label: 'Yearly Summary Report',
      route: '/reports/attendence-reports/yearly-summary-report',
      icon: '/time-off-icon/Yearly-summary-report-icon.png',
      description: MODULE_INFOS.ATTENDANCE_YEARLY_SUMMARY_REPORTS_MODULE_INFO,
      permission: { feature: 'Yearly Summary Report', action: 'view' }
    },
    {
      label: 'Permission Report',
      route: '/reports/attendence-reports/permission-report',
      icon: '/time-off-icon/permissions-icon.png',
      description: MODULE_INFOS.ATTENDANCE_PERMISSION_REPORTS_MODULE_INFO,
      permission: { feature: 'Permission Report', action: 'view' }
    },
    {
      label: 'Regularization Report',
      route: '/reports/attendence-reports/regularization-report',
      icon: '/time-off-icon/regularization-icon.png',
      description: MODULE_INFOS.ATTENDANCE_REGULARIZATION_REPORTS_MODULE_INFO,
      permission: { feature: 'Regularization Report', action: 'view' }
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