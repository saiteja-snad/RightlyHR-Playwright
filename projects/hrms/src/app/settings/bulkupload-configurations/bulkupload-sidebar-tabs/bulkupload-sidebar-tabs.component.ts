import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  icon?: string;
}

@Component({
  selector: 'app-bulkupload-sidebar-tabs',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './bulkupload-sidebar-tabs.component.html',
  styleUrl: './bulkupload-sidebar-tabs.component.scss'
})
export class BulkuploadSidebarTabsComponent {
  tabs: StatusTab[] = [
    {
      tabId: '/settings/bulkupload-configurations/bulk-import',
      label: 'Bulk Upload',
      link: '/settings/bulkupload-configurations/bulk-import',
      icon: 'icons/file-upload-icon.png'
    },
    {
      tabId: '/settings/bulkupload-configurations/historylog',
      label: 'View History',
      link: '/settings/bulkupload-configurations/historylog',
      icon: 'icons/info-icon.png'
    }
  ];

  constructor(private router: Router) {}

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
