import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-holidays-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './manage-holidays-tabs.component.html',
  styleUrl: './manage-holidays-tabs.component.scss'
})
export class ManageHolidaysTabsComponent {
  navLinks = [
    { label: 'Pending For Submit', route: '/settings/employee-fields/manage-holidays/pending-for-submit' },
    { label: 'Published Shifts', route: '/settings/employee-fields//manage-holidays/published-holidays' },

  ];
}
