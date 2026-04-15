import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-wfh-allocation-history-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './wfh-allocation-history-tabs.component.html',
  styleUrl: './wfh-allocation-history-tabs.component.scss'
})
export class WfhAllocationHistoryTabsComponent implements OnInit {
  navTabs = signal<any[]>([]);

  private allTabs = [
    {
      label: 'WFH Allocation History',
      link: '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation-view/wfh-history',
      permission: { feature: 'WFH Allocation History Tab', action: 'view' },
    },
    {
      label: 'Multi-Date Range History',
      link: '/settings/timeoff-configurations/flexible-wfh-allocation/wfh-allocation-view/multi-date-range-history',
      permission: { feature: 'Allow Multi Date Range History Tab', action: 'view' },
    }
  ];

  constructor(public router: Router, private rbac: RbacService) {}

  ngOnInit(): void {
    const filteredTabs = this.allTabs.filter(tab =>
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.navTabs.set(filteredTabs);

    if (filteredTabs.length > 0) {
      const currentRoute = this.router.url;
      const isOnValidTab = filteredTabs.some(tab => currentRoute.includes(tab.link));

      if (!isOnValidTab && currentRoute.includes('/wfh-allocation-view')) {
        this.router.navigate([filteredTabs[0].link]);
      }
    }
  }
}
