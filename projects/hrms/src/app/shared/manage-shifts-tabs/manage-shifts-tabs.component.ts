import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-shifts-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './manage-shifts-tabs.component.html',
  styleUrl: './manage-shifts-tabs.component.scss'
})
export class ManageShiftsTabsComponent {
  navLinks = [
    { label: 'Pending For Submit', route: '/settings/employee-fields/manage-shifts/pending-for-submit' },
    { label: 'Published shifts', route: '/settings/employee-fields/manage-shifts/published-shifts' },
   
  ];
}
