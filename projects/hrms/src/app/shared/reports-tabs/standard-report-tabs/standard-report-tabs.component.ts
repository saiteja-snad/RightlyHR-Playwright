import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-standard-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './standard-report-tabs.component.html',
  styleUrl: './standard-report-tabs.component.scss',
  encapsulation:ViewEncapsulation.None,
})

export class StandardReportTabsComponent {
  filteredTabs: any[] = [];
  navTabs = [
    { label: 'Employee Master Data', route: '/reports/standard-reports/employee-data', icon:'/reports-icons/employee.png',description:'In a world where creativity knows no bounds, the sun rises over the horizon, casting a golden hue on the vibrant landscape.',  permission: { feature: 'Employee Master Data', action: 'view' } },
    { label: 'Job Location Wise Data', route: '/reports/standard-reports/job-data', icon:'/reports-icons/job.png',description:'In a world where creativity knows no bounds, the sun rises over the horizon, casting a golden hue on the vibrant landscape.', permission: { feature: 'Job Location Wise Data', action: 'view' }, },
    { label: 'Branch Location Wise Data', route: '/reports/standard-reports/branch-data', icon:'/reports-icons/location.png',description:'In a world where creativity knows no bounds, the sun rises over the horizon, casting a golden hue on the vibrant landscape.', permission: { feature: 'Branch Location Wise Data', action: 'view' } },
    { label: 'Family Members Data', route: '/reports/standard-reports/family-data', icon:'/reports-icons/family.png',description:'In a world where creativity knows no bounds, the sun rises over the horizon, casting a golden hue on the vibrant landscape.', permission: { feature: 'Family Members Data', action: 'view' } },
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