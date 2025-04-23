import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings-manage-holidays-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-holidays-tabs.component.html',
  styleUrl: './settings-manage-holidays-tabs.component.scss'
})
export class SettingsManageHolidaysTabsComponent {
  navLinks = [
    { label: 'Pending For Submit', route: '/settings/employee-fields/manage-holidays/pending-for-submit' },
    { label: 'Published Holidays', route: '/settings/employee-fields//manage-holidays/published-holidays' },
  ];
}
