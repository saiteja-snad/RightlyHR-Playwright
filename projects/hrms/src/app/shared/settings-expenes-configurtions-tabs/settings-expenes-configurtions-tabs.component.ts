import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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

  // Define all tabs with associated permissions
  allTabs = [
    { label: 'Expenes Configuartion', route: '/settings/employee-fields/expenes/configuartion', permission: { feature: 'Expenes Configuartion', action: 'view' } },
    { label: 'Expense Allowed Days', route: '/settings/employee-fields/expenes/allowed-days', permission: { feature: 'Expense Allowed Days', action: 'view' } }
  ];

  constructor(public rbac: RbacService) {}

  ngOnInit(): void {
    // Filter tabs based on permission
    this.navTabs = this.allTabs.filter(tab =>
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }
}

