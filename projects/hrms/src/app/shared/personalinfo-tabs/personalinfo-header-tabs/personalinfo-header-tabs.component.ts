import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-personalinfo-header-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './personalinfo-header-tabs.component.html',
  styleUrl: './personalinfo-header-tabs.component.scss'
})
export class PersonalinfoHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'Personal', link: '/personalinfo/personal',permission: {features: ['My Info Personal Tab', 'Employee Info Personal Tab'], action: 'view' },},
    { label: 'Job', link: '/personalinfo/job',permission:{ features:['My Info Job Tab','Employee Info Job Tab',], action: 'view' },},
    { label: 'Documents', link: '/personalinfo/documents', permission: { features: ['My Info Documents Tab','Employee Info Documents Tab'], action: 'view' } },

    { label: 'Team Members', link: '/personalinfo/team',permission: { features: ['My Info Team Members Tab','Employee Info Team Members Tab'], action: 'view' } },
   
  ];

  constructor(
    private rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) {}

  ngOnInit(): void {
    this.navTabs = this.navTabs.filter((tab) => {
      if (tab.permission && tab.permission.features) {
        // Check if the user has access to any of the features
        return tab.permission.features.some((feature: string) =>
          this.rbac.allowedToAccess(`${feature}.${tab.permission.action}`)
        );
      } else if (tab.permission && tab.permission.feature) {
        // Check for a single feature
        return this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        );
      }
      return false;
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
