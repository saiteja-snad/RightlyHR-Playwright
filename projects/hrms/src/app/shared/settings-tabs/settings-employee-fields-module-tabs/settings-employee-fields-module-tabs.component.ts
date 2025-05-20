import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-settings-employee-fields-module-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-employee-fields-module-tabs.component.html',
  styleUrl: './settings-employee-fields-module-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsEmployeeFieldsModuleTabsComponent implements OnInit {
  navTabs: any[] = [];
  allTabs: any[] = [
    { label: 'Personal', link: '/settings/employee-fields/personal', permission: { feature: 'Personal Tab', action: 'view' } },
    { label: 'Job', link: '/settings/employee-fields/job',permission: { feature: 'Job Tab', action: 'view' } },
    { label: 'Document',link: '/settings/employee-fields/documents', permission: { feature: 'Document Tab', action: 'view' }  },
    { label: 'Manage Shifts', link: '/settings/employee-fields/manage-shifts', permission: { feature: 'Manage Shifts Tab', action: 'view' } },
    { label: 'Manage Policies', link: '/settings/employee-fields/manage-policies', permission: { feature: 'Manage Policies Tab', action: 'view' } },
    { label: 'Manage Holidays', link: '/settings/employee-fields/manage-holidays', permission: { feature: 'Manage Holidays Tab', action: 'view' } },
    { label: 'Manage Weekends', link: '/settings/employee-fields/manage-weekends', permission: { feature: 'Manage Weekends Tab', action: 'view' } },
    { label: 'Expense Configurations', link: '/settings/employee-fields/expenes', permission: { feature: 'Expense Tab', action: 'view' }  },
    { label: 'Manage DST', link: '/settings/employee-fields/manage-dsts', permission: { feature: 'Manage DST Tab', action: 'view' } },
    { label: 'No Due Clearance', link: '/settings/employee-fields/no-due-clearnce', permission: { feature: 'NoDue Clearance Tab', action: 'view' } }
  ];

    
  constructor(
    public rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.navTabs = this.allTabs.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
  
}