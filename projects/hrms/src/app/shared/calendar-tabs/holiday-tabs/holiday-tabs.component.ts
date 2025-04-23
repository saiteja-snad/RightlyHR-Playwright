import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-holiday-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './holiday-tabs.component.html',
  styleUrl: './holiday-tabs.component.scss'
})

export class HolidayTabsComponent {
  navTabs: any[] = [
    { label: 'Public Holidays', link: '/calendar/holiday/public-holidays' },
    { label: 'Optional Holidays', link: '/calendar/holiday/optional-holidays' },
  ];
}
