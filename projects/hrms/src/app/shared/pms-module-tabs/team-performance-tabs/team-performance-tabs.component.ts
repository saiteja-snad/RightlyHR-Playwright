import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-team-performance-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './team-performance-tabs.component.html',
  styleUrl: './team-performance-tabs.component.scss'
})

export class TeamPerformanceTabsComponent {
  navTabs: any[] = [
    { label: 'Pending Reviews', link: '/pms/team-performance/pending-review' },
    { label: 'Completed Reviews', link: '/pms/team-performance/completed-review' },
  ];
}
