import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-holiday-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './holiday-tabs.component.html',
  styleUrl: './holiday-tabs.component.scss'
})

export class HolidayTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'Public Holidays', link: '/holidays/public-holidays', permission: { feature: 'Holidays(Public)', action: 'view' } },
    { label: 'Optional Holidays', link: '/holidays/optional-holidays', permission: { feature: 'Holidays(Optional)', action: 'view' } },
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}