import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
@Component({
  selector: 'app-standard-report-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './standard-report-tabs.component.html',
  styleUrl: './standard-report-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class StandardReportTabsComponent implements OnInit {
  navTabs = [
    {
      label: 'Employee Master Data',
      route: '/reports/standard-reports/employee-data',
      permission: { feature: 'Employee Master Data', action: 'view' },
    },
    {
      label: 'Job Location Wise Data',
      route: '/reports/standard-reports/job-data',
      permission: { feature: 'Job Location Wise Data', action: 'view' },
    },
    {
      label: 'Branch Location Wise Data',
      route: '/reports/standard-reports/branch-data',
      permission: { feature: 'Branch Location Wise Data', action: 'view' },
    },
    {
      label: 'Family Members Data',
      route: '/reports/standard-reports/family-data',
      permission: { feature: 'Family Members Data', action: 'view' },
    },
  ];

  constructor(
    private rbac: RbacService,
    private accessNav: AccessNavigationService
  ) {}

  ngOnInit(): void {
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
  }

  
}