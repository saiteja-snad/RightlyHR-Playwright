import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-reports-main-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './reports-main-tabs.component.html',
  styleUrl: './reports-main-tabs.component.scss'
})

export class ReportsMainTabsComponent implements OnInit{
  navTabs: any[] = [];

  constructor(
    private rbac: RbacService
  ){ }

  ngOnInit(): void {
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    console.log(this.navTabs)
  }

  allTabs: any[] = [
    { label: 'Standard Reports', link: '/reports/standard-reports', permission: { feature: 'Standard Reports', action: 'view'}},
    { label: 'Custom Reports', link: '/reports/custom-reports' ,permission: { feature: 'Custom Reports', action: 'view'}},
    { label: 'Attendance Reports',link: '/reports/attendence-reports', permission: { feature: 'Attendance Reports', action: 'view' }},
    { label: 'Monthly Attendance Report', link: '/reports/monthly-attandance-reports' ,permission: { feature: 'Monthly Attandance Report', action: 'view'}},
  ];

}