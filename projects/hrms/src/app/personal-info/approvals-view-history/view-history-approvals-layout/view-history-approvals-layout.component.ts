import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-view-history-approvals-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule],
  templateUrl: './view-history-approvals-layout.component.html',
  styleUrl: './view-history-approvals-layout.component.scss'
})

export class ViewHistoryApprovalsLayoutComponent {
  navTabsViewHistory: any[] = [];

  constructor(public router: Router, public rbac: RbacService) {}

  ngOnInit(): void {
    this.viewHistoryTabItems();
  }

  viewHistoryTabItems() {
    this.navTabsViewHistory = [
      {
        label: 'Personal',
        link: '/myinfo/approvals/personal',
        permission: { feature: 'My Info Personal Approval History', action: 'view' }
      },
      {
        label: 'Job',
        link: '/myinfo/approvals/job',
        permission: { feature: 'My Info Job Approval History', action: 'view' }
      },
      {
        label: 'Documents',
        link: '/myinfo/approvals/documents',
        permission: { feature: 'My Info Documents Approval History', action: 'view' }
      }
    ].filter(tab =>
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }
}
