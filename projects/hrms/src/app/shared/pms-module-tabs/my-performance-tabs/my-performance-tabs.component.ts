import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-my-performance-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './my-performance-tabs.component.html',
  styleUrl: './my-performance-tabs.component.scss'
})

export class MyPerformanceTabsComponent {

  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'Pending Reviews', link: '/pms/myPerformance/pending-review', permission: { feature: 'Pending Reviews', action: 'view' } },
    { label: 'Completed Reviews', link: '/pms/myPerformance/completed-review', permission: { feature: 'Completed Reviews', action: 'view' } },
   ];
   
  constructor(private rbac: RbacService) {}

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
