import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-settings-expenes-configurtions-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './settings-expenes-configurtions-tabs.component.html',
  styleUrl: './settings-expenes-configurtions-tabs.component.scss'
})
export class SettingsExpenesConfigurtionsTabsComponent implements OnInit {
  public navTabs: any[] = [];

  allTabs = [
    { label: 'Expenes Configuartion', route: '/settings/employee-fields/expenes/configuartion', permission: { feature: 'Expenes Configuartion', action: 'view' } },
    { label: 'Expense Allowed Days', route: '/settings/employee-fields/expenes/allowed-days', permission: { feature: 'Expense Allowed Days', action: 'view' } }
  ];

  constructor(
    public rbac: RbacService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac() : void{  
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    const currentUrl = this.router.url;
    const baseUrl = '/settings/employee-fields/expenes';

    // If current URL is base or invalid, redirect to first allowed tab
    if ((currentUrl === baseUrl || !this.navTabs.some(tab => tab.route === currentUrl)) && this.navTabs.length > 0) {
      this.router.navigateByUrl(this.navTabs[0].route);
    }
  }
}

