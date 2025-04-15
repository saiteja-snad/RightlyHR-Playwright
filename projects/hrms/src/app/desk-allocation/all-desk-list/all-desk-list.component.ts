import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-all-desk-list',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './all-desk-list.component.html',
  styleUrl: './all-desk-list.component.scss'
})
export class AllDeskListComponent {
  navTabs: any[] = [
    { label: 'All Desks', link: '/desk/management/all-desks',},
    { label: 'Available Desks', link: '/desk/available-desks', },
    { label: 'Allocated Desks', link: '/desk/allocated-desk', },
    { label: 'Under Maintenance', link: '/desk/under-maintenance-desk' },
    { label: 'Inactive Desks', link: '/desk/inactive-desk',  },
    { label: 'Waiting for Approval', link: '/desk/waiting-for-approval-desks',  }
  ];
}
