import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
@Component({
  selector: 'app-reports-main-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './reports-main-tabs.component.html',
  styleUrl: './reports-main-tabs.component.scss'
})

export class ReportsMainTabsComponent implements OnInit{
  navTabs: any[] = [];

  allTabs: any[] = [
    { label: 'Standard Reports', link: '/reports/standard-reports', permission: { feature: 'Standard Reports', action: 'view'}},
    { label: 'Custom Reports', link: '/reports/custom-reports' ,permission: { feature: 'Custom Reports', action: 'view'}},
    { label: 'Attendance Reports',link: '/reports/attendence-reports', permission: { feature: 'Attendance Reports', action: 'view' }},
    { label: 'Monthly Attendance Report', link: '/reports/monthly-attandance-reports' ,permission: { feature: 'Monthly Attendance Reports', action: 'view'}},
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