import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-calendar-header-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './calendar-header-tabs.component.html',
  styleUrl: './calendar-header-tabs.component.scss'
})

export class CalendarHeaderTabsComponent implements OnInit {
  public navTabs: any[] = [];

  private allTabs = [
    { label: 'Calendar', link: '/calendar/calendarview', permission: { feature: 'Calender Tab', action: 'view' } },
    { label: 'Holidays', link: '/calendar/holiday', permission: { feature: 'Holidays Tab', action: 'view' } },
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

    const currentUrl = this.router.url;
    const baseUrl = '/calendar';

    // Redirect to first accessible route if on base URL
    if (currentUrl === baseUrl && this.navTabs.length > 0) {
      this.router.navigateByUrl(this.navTabs[0].link);
      return;
    }

    // If current route isn't allowed, redirect to first accessible tab
    const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
    if (!isAllowed && this.navTabs.length > 0) {
      this.router.navigateByUrl(this.navTabs[0].link);
    }
  }
}