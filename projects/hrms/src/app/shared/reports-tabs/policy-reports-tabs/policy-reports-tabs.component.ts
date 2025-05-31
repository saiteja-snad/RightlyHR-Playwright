import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-policy-reports-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './policy-reports-tabs.component.html',
  styleUrl: './policy-reports-tabs.component.scss'
})
export class PolicyReportsTabsComponent {
  filteredTabs: any[] = [];
  navTabs = [
    { label: 'Policy Acknowledgement Report', route: '/reports/policy-reports/policy-acknowledgement-report', icon:'/time-off-icon/leaves-icon.png',  permission: { feature: 'Policy Acknowledgement Report', action: 'view' } },
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
