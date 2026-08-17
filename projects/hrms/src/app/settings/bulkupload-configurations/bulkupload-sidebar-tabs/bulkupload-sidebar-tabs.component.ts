import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  icon?: string;
  permission?: { feature: string; action: string };
}

@Component({
  selector: 'app-bulkupload-sidebar-tabs',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './bulkupload-sidebar-tabs.component.html',
  styleUrl: './bulkupload-sidebar-tabs.component.scss'
})
export class BulkuploadSidebarTabsComponent implements OnInit {
  tabs: StatusTab[] = [];
  allTabs: StatusTab[] = [
    {
      tabId: '/settings/bulkupload-configurations/bulk-import',
      label: 'Bulk Upload',
      link: '/settings/bulkupload-configurations/bulk-import',
      icon: 'icons/file-upload-icon.png',
      permission: { feature: 'Bulk Upload', action: 'view' }
    },
    {
      tabId: '/settings/bulkupload-configurations/historylog',
      label: 'View History',
      link: '/settings/bulkupload-configurations/historylog',
      icon: 'icons/info-icon.png',
      permission: { feature: 'View History', action: 'view' }
    }
  ];

  constructor(
    private router: Router,
    private rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.tabs = this.allTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigate(link: string): void {
    this.router.navigate([link], { queryParamsHandling: 'preserve' });
  }

  isTabActive(link: string): boolean {
    const currentUrl = this.router.url.split('?')[0];
    return currentUrl === link || currentUrl.startsWith(link);
  }

  trackByTabId(index: number, tab: StatusTab): string {
    return tab.tabId;
  }
}
