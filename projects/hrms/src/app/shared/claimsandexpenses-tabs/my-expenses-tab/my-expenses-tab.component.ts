import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-my-expenses-tab',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './my-expenses-tab.component.html',
  styleUrl: './my-expenses-tab.component.scss'
})

export class MyExpensesTabComponent implements OnInit {
  public navTabs: any[] = [];

  private allTabs = [
    { label: 'Expenses', link: '/claimsandexpenses/expenses', permission: { feature: 'Expenses Module', action: 'view' } },
  ];

  constructor(public rbac: RbacService, private router: Router) {}

  ngOnInit(): void {
    // Filter tabs based on permission
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }
}