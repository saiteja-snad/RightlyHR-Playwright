import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-pms-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './pms-tabs.component.html',
  styleUrl: './pms-tabs.component.scss'
})

export class PmsTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  constructor(private rbac: RbacService) {}
  navTabs: any[] = [
    { label: 'Review Cycle List', link: '/pms/review-cycle', permission: { feature: 'Review Cycle List', action: 'view' } },
    { label: 'Review Cycle Employee List', link: '/pms/apprisal', permission: { feature: 'Review Cycle Employee List', action: 'view'} },
    { label: 'My Performance Review', link: '/pms/myPerformance', permission: {feature: 'My Performance Review', action: 'view'} },
    { label: 'My Team Performance Review', link: '/pms/team-performance', permission: {feature: 'My Team Performance Review', action: 'view'} },
  ];

  ngOnInit(): void {
    this.filterTabsByRbac();
  }
  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      const value = this.rbac.allowedToAccess(permissionString);
      console.log(value);
      return value;
    });
  }
}