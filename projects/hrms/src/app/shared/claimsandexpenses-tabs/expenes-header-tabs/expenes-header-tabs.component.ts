import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-expenes-header-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './expenes-header-tabs.component.html',
  styleUrl: './expenes-header-tabs.component.scss'
})
export class ExpenesHeaderTabsComponent {
  navTabs: any[] = [
    { label: 'Draft', link: '/claimsandexpenses/expenses/draft', count: 9 },
    { label: 'Approved', link: '/claimsandexpenses/expenses/approved', count: 9 },
    { label: 'Pending', link: '/claimsandexpenses/expenses/pending', count: 4 },
    { label: 'Processed', link: '/claimsandexpenses/expenses/processed', count: 9 },
    { label: 'Rejected', link: '/claimsandexpenses/expenses/rejected', count: 9 }
  ];
}
