import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-events-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './events-tabs.component.html',
  styleUrl: './events-tabs.component.scss'
})

export class EventsTabsComponent {
  navTabs: any[] = [
    { label: 'Upcoming Events', link: '/events/upcoming' },
    // { label: 'past Events', link: '/events/past' },
  ];
}
