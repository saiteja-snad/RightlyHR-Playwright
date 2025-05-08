import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
@Component({
  selector: 'app-settings-personal-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './settings-personal-tabs.component.html',
  styleUrl: './settings-personal-tabs.component.scss'
})

export class SettingsPersonalTabsComponent implements OnInit {
  public navLinks: any[] = [];

  allNavLinks = [
    { label: 'Salutation', route: '/settings/employee-fields/personal/salutation', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Status', route: '/settings/employee-fields/personal/status', permission: { feature: 'Status', action: 'view' } },
    { label: 'Gender', route: '/settings/employee-fields/personal/gender', permission: { feature: 'Gender', action: 'view' } },
    { label: 'Marital Status', route: '/settings/employee-fields/personal/maritalstatus', permission: { feature: 'Marital Status', action: 'view' } },
    { label: 'Degree', route: '/settings/employee-fields/personal/degree', permission: { feature: 'Degree', action: 'view' } },
    { label: 'Visa Type', route: '/settings/employee-fields/personal/visatype', permission: { feature: 'Visa Type', action: 'view' } },
    { label: 'Identity Type', route: '/settings/employee-fields/personal/identitytype', permission: { feature: 'Identity Type', action: 'view' } },
    { label: 'Relationship', route: '/settings/employee-fields/personal/relationship', permission: { feature: 'Relationship', action: 'view' } },
    { label: 'Bank Names', route: '/settings/employee-fields/personal/bank-name', permission: { feature: 'Bank Names', action: 'view' } },
  ];

  constructor(public rbac: RbacService, private router: Router,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
   this.filterTabsByRbac();
  }

  filterTabsByRbac() {
     // filter the links which the user has access to
     this.navLinks = this.allNavLinks.filter(link =>
      link.permission && link.permission.feature && link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
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