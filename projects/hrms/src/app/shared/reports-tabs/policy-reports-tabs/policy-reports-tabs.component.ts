import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-policy-reports-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './policy-reports-tabs.component.html',
  styleUrl: './policy-reports-tabs.component.scss'
})
export class PolicyReportsTabsComponent {
  filteredTabs: any[] = [];
  navTabs = [
    { label: 'Policy Acknowledgement Report', 
      route: '/reports/policy-reports/policy-acknowledgment-report', 
      icon:'/time-off-icon/leaves-icon.png',  
      description: MODULE_INFOS.POLICY_REPORTS_POLICY_ACK_REPORT_MODULE_INFO,
      permission: { feature: 'Policy Acknowledgement Report', action: 'view' } },
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
