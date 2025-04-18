import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-onbehalfoff-approvals-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './onbehalfoff-approvals-tabs.component.html',
  styleUrl: './onbehalfoff-approvals-tabs.component.scss'
})

export class OnbehalfoffApprovalsTabsComponent {
  navTabs: any[] = [
    { label: 'Time Off', link: '/time-off/on-behalf-of-approvals/time-off' },
    { label: 'Comp Off Entitlement', link: '/time-off/on-behalf-of-approvals/entitlement' },
    { label: 'WFH', link: '/time-off/on-behalf-of-approvals/wfh' },
    { label: 'Permissions', link: '/time-off/on-behalf-of-approvals/permissions' },
  ];
}
