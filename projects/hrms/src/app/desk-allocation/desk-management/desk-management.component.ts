import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-desk-management',
  imports: [CommonModule,TabsModule,RouterModule],
  templateUrl: './desk-management.component.html',
  styleUrl: './desk-management.component.scss'
})
export class DeskManagementComponent {
  navTabs: any[] = [
    { label: 'All Desks', link: '/desk/management/all-desks',},
    { label: 'Available Desks', link: '/desk/management/available-desks', },
    { label: 'Allocated Desks', link: '/desk/management/allocated-desk', },
    { label: 'Under Maintenance', link: '/desk/management/under-maintenance-desk' },
    { label: 'Inactive Desks', link: '/desk/management/inactive-desk',  },
    { label: 'Waiting for Approval', link: '/desk/management/waiting-for-approval-desks',  }
  ];
  
}
