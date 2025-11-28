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

  permissionKeys = {
  myinfo: {
    personal: 'My Info Personal Approval History.view',
    job: 'My Info Job Approval History.view',
    documents: 'My Info Documents Approval History.view'
  },
  personalinfo: {
    personal: 'Employee Personal Approval History.view',
    job: 'Employee Job Approval History.view',
    documents: 'Employee Documents Approval History.view'
  }
};

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
  const key = this.basePath === '/personalinfo' ? 'personalinfo' : 'myinfo';

  this.navTabsViewHistory = [
    {
      label: 'Personal',
      link: `${this.basePath}/approvals/personal`,
      permission: this.permissionKeys[key].personal
    },
    {
      label: 'Job',
      link: `${this.basePath}/approvals/job`,
      permission: this.permissionKeys[key].job
    },
    {
      label: 'Documents',
      link: `${this.basePath}/approvals/documents`,
      permission: this.permissionKeys[key].documents
    }
  ].filter(tab => this.rbac.allowedToAccess(tab.permission));
}


  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link);
  }
}
