import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-it-support-reports-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './it-support-reports-tabs.component.html',
  styleUrl: './it-support-reports-tabs.component.scss'
})
export class ItSupportReportsTabsComponent {
filteredTabs: any[] = [];
  navTabs = [
    {
      label: 'IT Support Detailed Report',
      route: '/reports/itsupport-reports/itsupport-detailed-report',
      icon: '/reports-icons/my-timesheet-report.png',
      description: MODULE_INFOS.IT_SUPPORT_DETAILED_REPORTS_MODULE_INFO,
      permission: { feature: 'IT Support Detailed Report', action: 'view' }
    },
    {
      label: 'IT Support Summary Report',
      route: '/reports/itsupport-reports/itsupport-summary-report',
      icon: '/reports-icons/timesheet-summary-monthly-report.png',
      description: MODULE_INFOS.IT_SUPPORT_SUMMARY_REPORTS_MODULE_INFO,
      permission: { feature: 'IT Support Summary Report', action: 'view' }
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
