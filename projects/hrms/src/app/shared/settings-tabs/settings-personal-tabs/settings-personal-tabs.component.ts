import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
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

  constructor(public rbac: RbacService, private router: Router) { }

  ngOnInit(): void {
    // filter the links which the user has access to
    this.navLinks = this.allNavLinks.filter(link =>
      link.permission && link.permission.feature && link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
    // const currentUrl = this.router.url.split('?')[0];
    // const baseUrl = '/settings/employee-fields/personal';
    // // redirect to the first link if the user is on the base URL
    // if (currentUrl === baseUrl && this.navLinks.length > 0) {
    //   this.router.navigateByUrl(this.navLinks[0].route);
    //   return;
    // }
    // // if dont have access to the current URL, redirect to the first link
    // const isAllowed = this.navLinks.some(link => currentUrl.startsWith(link.route));
    // if (!isAllowed && this.navLinks.length > 0) {
    //   this.router.navigateByUrl(this.navLinks[0].route);
    // }
  }
}