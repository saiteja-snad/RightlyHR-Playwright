
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-attandace-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './attandace-report-tabs.component.html',
  styleUrl: './attandace-report-tabs.component.scss'
})
export class AttandaceReportTabsComponent {
  filteredTabs: any[] = [];

  navTabs = [
    { label: 'Leave Report', route: '/reports/attendence-reports/leave-report', permission: { feature: 'Leave Report', action: 'view' } },
    { label: 'Leave Summary Report', route: '/reports/attendence-reports/leave-summary-report',permission: { feature: 'Leave Summary Report', action: 'view' } },
    { label: 'Comp Off Report', route: '/reports/attendence-reports/compoff-report',permission: { feature: 'Comp Off Report', action: 'view' } },
    { label: 'WFH Report', route: '/reports/attendence-reports/wfh-report',permission: { feature: 'WFH Report', action: 'view' } },
    // { label: 'Absent Report', route: '/reports/attendence-reports/absent-report',permission: { feature: 'Absent Report', action: 'view' } },
    { label: 'Inactive Employee Report', route: '/reports/attendence-reports/inactive-employee-report',permission: { feature: 'Inactive Empolyee Report', action: 'view' } },
    { label: 'Yearly Summary Report', route: '/reports/attendence-reports/yearly-summary-report',permission: { feature: 'Yearly Summary Report', action: 'view' } },
    { label: 'Permission Report', route: '/reports/attendence-reports/permission-report',permission: { feature: 'Permission Report', action: 'view' } },
    { label: 'Regularization Report', route: '/reports/attendence-reports/regularization-report',permission: { feature: 'Regularization Report', action: 'view' } },
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
