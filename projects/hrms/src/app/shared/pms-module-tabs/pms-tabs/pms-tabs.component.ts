import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-pms-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './pms-tabs.component.html',
  styleUrl: './pms-tabs.component.scss'
})

export class PmsTabsComponent {
  navTabs: any[] = [
    { label: 'Review Cycle', link: '/pms/review-cycle' },
    { label: 'Review Cycle Employee Lists', link: '/pms/apprisal' },
    { label: 'My Performance Review', link: '/pms/myPerformance' },
    { label: 'Team Performance Review', link: '/pms/team-performance' },
  ];
}