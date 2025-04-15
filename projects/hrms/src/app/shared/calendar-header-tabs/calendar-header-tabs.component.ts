import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-calendar-header-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './calendar-header-tabs.component.html',
  styleUrl: './calendar-header-tabs.component.scss'
})
export class CalendarHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'Calendar', link: '/calendar/calendarview' },
    { label: 'Holidays', link: '/calendar/holiday' },
  
  ];
}
