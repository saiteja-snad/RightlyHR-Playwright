import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-my-performance-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './my-performance-tabs.component.html',
  styleUrl: './my-performance-tabs.component.scss'
})

export class MyPerformanceTabsComponent {
  navTabs: any[] = [
    { label: 'Pending Reviews', link: '/pms/myPerformance/pending-review' },
    { label: 'Completed Reviews', link: '/pms/myPerformance/completed-review' },
  ];
}
