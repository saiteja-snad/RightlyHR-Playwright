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
  styleUrl: './view-history-approvals-layout.component.scss',
})
export class ViewHistoryApprovalsLayoutComponent {
  navTabsViewHistory: any[] = [];

  constructor(public router: Router, public rbac: RbacService) {}

  ngOnInit(): void {
    this.setBasePath();
    this.viewHistoryTabItems();
  }

  basePath = '/myinfo';

  setBasePath() {
    const url = this.router.url;
    if (url.startsWith('/personalinfo')) {
      this.basePath = '/personalinfo';
    } else if (url.startsWith('/myinfo')) {
      this.basePath = '/myinfo';
    }
  }

  viewHistoryTabItems() {
    this.navTabsViewHistory = [
      {
        label: 'Personal',
        link: `${this.basePath}/approvals/personal`,
        permission: {
          feature: 'My Info Personal Approval History',
          action: 'view',
        },
      },
      {
        label: 'Job',
        link: `${this.basePath}/approvals/job`,
        permission: { feature: 'My Info Job Approval History', action: 'view' },
      },
      {
        label: 'Documents',
        link: `${this.basePath}/approvals/documents`,
        permission: {
          feature: 'My Info Documents Approval History',
          action: 'view',
        },
      },
    ].filter((tab) =>
      this.rbac.allowedToAccess(
        `${tab.permission.feature}.${tab.permission.action}`
      )
    );
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link);
  }
}
