import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-comp-off-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './comp-off-request-tabs.component.html',
  styleUrl: './comp-off-request-tabs.component.scss'
})
export class CompOffRequestTabsComponent {
  constructor(public readonly router: Router) {}
  navTabs: any[] = [
    { label: 'For You ', link: 'for-you', count: 9 },
    { label: 'For Your Role', link: 'for-your-role', count: 9 },
   
  ];
}
