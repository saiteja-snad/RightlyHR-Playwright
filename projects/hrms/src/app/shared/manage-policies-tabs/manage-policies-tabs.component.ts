import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-policies-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './manage-policies-tabs.component.html',
  styleUrl: './manage-policies-tabs.component.scss'
})
export class ManagePoliciesTabsComponent {
  navLinks = [
    { label: 'Pending For Submit', route: '/settings/employee-fields/manage-policies/pending-for-submit' },
    { label: 'Published Policies', route: '/settings/employee-fields//manage-policies/published-policies' },

  ];
}
