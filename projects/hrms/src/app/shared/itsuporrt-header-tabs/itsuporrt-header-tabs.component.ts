import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';

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

  constructor(private rbac: RbacService, private router: Router, 
      private accessNav: AccessNavigationService) {}

  ngOnInit(): void {
    // Filter tabs based on RBAC permission
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission && tab.permission.feature && tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

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
