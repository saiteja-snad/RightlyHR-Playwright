import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-pms-settings-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './pms-settings-tabs.component.html',
  styleUrl: './pms-settings-tabs.component.scss'
})
export class PmsSettingsTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  constructor(private rbac: RbacService) {}
  navTabs: any[] = [
    { label: 'Increment Percentage', link: '/pmsconfiguration/increment', permission: { feature: 'Increment Percentage', action: 'view' } },
    { label: 'Assessor Configuration', link: '/pmsconfiguration/assessor', permission: { feature: 'Assessor Configuration', action: 'view'} },
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
