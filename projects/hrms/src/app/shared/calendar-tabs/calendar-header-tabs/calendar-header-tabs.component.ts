import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-calendar-header-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './calendar-header-tabs.component.html',
  styleUrl: './calendar-header-tabs.component.scss'
})

export class CalendarHeaderTabsComponent {

   filteredTabs: any[] = [];
  constructor(public rbac: RbacService) { }

  navTabs: any[] = [
    { label: 'Calendar', link: '/calendar/calendarview', permission: { feature: 'Calender Tab', action: 'view' } },
    { label: 'Holidays', link: '/calendar/holiday', permission: { feature: 'Holidays Tab', action: 'view' } },
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