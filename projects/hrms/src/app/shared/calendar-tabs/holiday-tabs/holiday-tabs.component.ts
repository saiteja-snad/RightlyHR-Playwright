import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-holiday-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './holiday-tabs.component.html',
  styleUrl: './holiday-tabs.component.scss'
})

export class HolidayTabsComponent {

  filteredTabs: any[] = [];
  constructor(public rbac: RbacService) { }

  navTabs: any[] = [
    { label: 'Public Holidays', link: '/calendar/holiday/public-holidays', permission: { feature: 'Holidays(Public)', action: 'view' } },
    { label: 'Optional Holidays', link: '/calendar/holiday/optional-holidays', permission: { feature: 'Holidays(Optional)', action: 'view' } },
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
