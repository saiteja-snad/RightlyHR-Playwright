import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-itsuporrt-header-tabs',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './itsuporrt-header-tabs.component.html',
  styleUrl: './itsuporrt-header-tabs.component.scss'
})
export class ItsuporrtHeaderTabsComponent implements OnInit {
  navTabs: any[] = [];
  
  private allTabs = [
    { label: 'My Tickets', link: '/it-support/mytickets', permission: { feature: 'My Tickets Tab', action: 'view' } },
    { label: 'Team Tickets', link: '/it-support/team-tickets', permission: { feature: 'Team Tickets Tab', action: 'view' } },
  ];

  constructor(private rbac: RbacService, private router: Router) {}

  ngOnInit(): void {
    // Filter tabs based on RBAC permission
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission && tab.permission.feature && tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    const currentUrl = this.router.url;
    const baseUrl = '/it-support';

    // Redirect to first allowed tab if on base route
    if (currentUrl === baseUrl && this.navTabs.length > 0) {
      this.router.navigateByUrl(this.navTabs[0].link);
      return;
    }

    // Redirect to first allowed tab if current route isn't permitted
    const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
    if (!isAllowed && this.navTabs.length > 0) {
      this.router.navigateByUrl(this.navTabs[0].link);
    }
  }
}
