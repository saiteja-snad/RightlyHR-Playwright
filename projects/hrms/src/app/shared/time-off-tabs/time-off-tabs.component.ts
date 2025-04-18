import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-time-off-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './time-off-tabs.component.html',
  styleUrl: './time-off-tabs.component.scss',
})
export class TimeOffTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  navTabs: any[] = [
    { label: 'Time-Off', link: '/time-off/leaves/waiting-for-approval',permission: { feature: 'Timeoff Tab', action: 'view' } },
    { label: 'WFH', link: '/time-off/wfh/waiting-for-approval', permission: { feature: 'Workfromhome Tab', action: 'view' }},
    { label: 'Comp-Off', link: '/time-off/comp-off/waiting-for-approval', permission: { feature: 'Compoff Tab', action: 'view' }},
    { label: 'Permissions', link: '/time-off/premissions/waiting-for-approval',permission: { feature: 'Permissions Tab', action: 'view' } },
    { label: 'Regularization', link: '/time-off/regularization/waiting-for-approval',permission: { feature: 'Regularization Tab', action: 'view' } },
    { label: 'Pending Approvals', link: '/time-off/pending-approvals/time-off-request/for-you', },
    { label: 'Attendance', link: '/time-off/attendance' },
    { label: 'On Behalf Of', link: '/time-off/on-behalf-of/waiting-for-approval',permission: { feature: 'On Behalf Of Tab', action: 'view' } },
    { label: 'On Behalf Of Approvals', link: '/time-off/on-behalf-of-approvals',permission: { feature: 'On Behalf Of Approvals Tab', action: 'view' } },
    {label:'Remote Login',link:'/time-off/remote'}
  ];
}
