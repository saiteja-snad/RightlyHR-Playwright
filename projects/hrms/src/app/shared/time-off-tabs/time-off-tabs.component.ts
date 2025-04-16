import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-time-off-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './time-off-tabs.component.html',
  styleUrl: './time-off-tabs.component.scss'
})
export class TimeOffTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  navTabs: any[] = [
    { label: 'Time-Off', link: '/time-off/leaves/waiting-for-approval' },
    { label: 'WFH', link: '/time-off/wfh/waiting-for-approval' },
    { label: 'Comp-Off', link: '/time-off/comp-off/waiting-for-approval' },
    { label: 'Permissions', link: '/time-off/premissions/waiting-for-approval' },
    { label: 'Regularization', link: '/time-off/regularization/waiting-for-approval' },
    { label: 'Pending Approvals', link: '/time-off/pending-approvals/time-off-request/for-you' },
    { label: 'Attendance', link: '/time-off/attendance' },
    { label: 'On Behalf Of', link: '/time-off/on-behalf-of/waiting-for-approval' },
    { label: 'On Behalf Of Approvals', link: '/user/assignee' }
  ];
  
}
