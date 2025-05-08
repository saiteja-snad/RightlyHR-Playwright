import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-team-performance-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './team-performance-tabs.component.html',
  styleUrl: './team-performance-tabs.component.scss'
})

export class TeamPerformanceTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'Pending Reviews', link: '/pms/team-performance/pending-review', permission: { feature: 'Team Pending Reviews', action: 'view' } },
    { label: 'Completed Reviews', link: '/pms/team-performance/completed-review', permission: { feature: 'Team Completed Reviews', action: 'view' } },
  ];

  constructor(public rbac : RbacService) { }

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
