import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-help-desk-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './help-desk-report-tabs.component.html',
  styleUrl: './help-desk-report-tabs.component.scss'
})
export class HelpDeskReportTabsComponent {
filteredTabs: any[] = [];
  navTabs = [
    {
      label: 'Help Desk Query Detailed Report',
      route: '/reports/helpdesk-reports/detailed-queries-report',
      icon: '/reports-icons/my-timesheet-report.png',
      description: MODULE_INFOS.HELP_DESK_DETAILED_REPORTS_MODULE_INFO,
      permission: { feature: 'Help Desk Query Detailed Report', action: 'view' }
    },
    {
      label: 'Help Desk Query Summary Report',
      route: '/reports/helpdesk-reports/queries-summary-report',
      icon: '/reports-icons/timesheet-summary-monthly-report.png',
      description: MODULE_INFOS.HELP_DESK_SUMMARY_REPORTS_MODULE_INFO,
      permission: { feature: 'Help Desk Query Summary Report', action: 'view' }
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
