import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-performace-review-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './performace-review-tabs.component.html',
  styleUrl: './performace-review-tabs.component.scss'
})

export class PerformaceReviewTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'My Performance Review', link: '/pms/performace-review/myPerformance', permission: { feature: 'My Performance Review', action: 'view' } },
    { label: 'My Team Performance Review', link: '/pms/performace-review/team-performance', permission: { feature: 'My Team Performance Review', action: 'view' } },
  ];

  constructor(private rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      const value = this.rbac.allowedToAccess(permissionString);
      return value;
    });
  }
}