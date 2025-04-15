import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-attendance-regularization-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './attendance-regularization-request-tabs.component.html',
  styleUrl: './attendance-regularization-request-tabs.component.scss'
})
export class AttendanceRegularizationRequestTabsComponent {
  constructor(public readonly router: Router) {}

  navTabs: any[] = [
    { label: 'For You ', link: 'for-you', count: 9 },
    { label: 'For Your Role', link: 'for-your-role', count: 9 },
   
  ];
}
