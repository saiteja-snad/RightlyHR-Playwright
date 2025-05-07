import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-employee-fields-module-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-employee-fields-module-tabs.component.html',
  styleUrl: './settings-employee-fields-module-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsEmployeeFieldsModuleTabsComponent implements OnInit {
  public navTabs: any[] = [];
  public defaultRoute: string = '';

  
  allTabs: any[] = [
    { label: 'Personal', link: '/settings/employee-fields/personal', permission: { feature: 'Personal Tab', action: 'view' } },
    { label: 'Job', link: '/settings/employee-fields/job', permission: { feature: 'Job Tab', action: 'view' } },
    { label: 'Document', link: '/settings/employee-fields/documents', permission: { feature: 'Document Tab', action: 'view' } },
    { label: 'Manage Shifts', link: '/settings/employee-fields/manage-shifts', permission: { feature: 'Manage Shifts Tab', action: 'view' } },
    { label: 'Manage Policies', link: '/settings/employee-fields/manage-policies', permission: { feature: 'Manage Policies Tab', action: 'view' } },
    { label: 'Manage Holidays', link: '/settings/employee-fields/manage-holidays', permission: { feature: 'Manage Holidays Tab', action: 'view' } },
    { label: 'Manage Weekends', link: '/settings/employee-fields/manage-weekends', permission: { feature: 'Manage Weekends Tab', action: 'view' } },
    { label: 'Expense Configurations', link: '/settings/employee-fields/expenes', permission: { feature: 'Expense Tab', action: 'view' } },
    { label: 'Manage DST', link: '/settings/employee-fields/manage-dsts', permission: { feature: 'Manage DST Tab', action: 'view' } },
    { label: 'No Due Clearance', link: '/settings/employee-fields/no-due-clearnce', permission: { feature: 'NoDue Clearance Tab', action: 'view' } }
  ];

  constructor(
    private rbac: RbacService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac() : void{
    // Filter tabs based on RBAC permissions
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    // Set default route to the first allowed tab
    if (this.navTabs.length > 0) {
      this.defaultRoute = this.navTabs[0].link;
    }

    // Check current URL and redirect if necessary
    const currentUrl = this.router.url;
    const baseUrl = '/settings/employee-fields';

    // If at base URL, redirect to the first allowed route
    if (currentUrl === baseUrl && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
      return;
    }

    // If the current route is not allowed, redirect to first accessible
    const isAllowed = this.navTabs.some(tab => currentUrl.startsWith(tab.link));
    if (!isAllowed && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
    }
  }

}