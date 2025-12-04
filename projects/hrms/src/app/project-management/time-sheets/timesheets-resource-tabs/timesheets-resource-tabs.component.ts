import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { TimesheetFilterService } from '../../../services/timesheet-filter.service';
import { EncriptdecriptService } from '../../../services/encriptdecript.service';

@Component({
  selector: 'app-timesheets-resource-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './timesheets-resource-tabs.component.html',
  styleUrl: './timesheets-resource-tabs.component.scss'
})
export class TimesheetsResourceTabsComponent {
   filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs = [
    {
      label: 'Summary', link: '/project-management/timesheet/resourcesummary', icon: '/icons/project-summary-icon.png',
      permission: { feature: 'Team Time Sheet Summary Tab', action: 'view' }
    },
    {
      label: 'Detailed', link: '/project-management/timesheet/summary', icon: '/icons/project-detailed-icon.png',
      permission: { feature: 'Team Time Sheet Detailed Tab', action: 'view' }
    },
    
  ];

  constructor(private rbac: RbacService, private router: Router, private route: ActivatedRoute,
    private filterService: TimesheetFilterService, private encryptionService: EncriptdecriptService) { }

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

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    // Exact match or starts with followed by `/` to avoid partial matches
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }


  isDocumentTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Remove query params
    // For Documents tab, check both documents and inactivedocuments routes
    if (link === '/project-management/timesheet/summary') {
      return currentUrl === '/project-management/timesheet/summary';
    }
    if (link === '/project-management/timesheet/resourcesummary') {
      return currentUrl === '/project-management/timesheet/resourcesummary';
    }
    // For other tabs, use exact match
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  navigateWithFilters(link: string): void {
    const currentQueryParams = this.route.snapshot.queryParams;
    if (currentQueryParams['data']) {
      this.router.navigate([link], { queryParams: { data: currentQueryParams['data'] } });
    } else {
      const savedFilters = this.filterService.getCurrentFilters();
      if (savedFilters) {
        const encryptedData = this.encryptionService.encrypt(savedFilters);
        this.router.navigate([link], { queryParams: { data: encryptedData } });
      } else {
        this.router.navigate([link]);
      }
    }
  }

}
