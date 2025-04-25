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
  constructor(public rbac: RbacService,) { }

  navTabs: any[] = [
    { label: 'Calendar', link: '/calendar/calendarview', permission: { feature: 'Calendar', action: 'view' } },
    { label: 'Holidays', link: '/calendar/holiday', permission: { feature: 'Holidays', action: 'view' } },
  ];
}