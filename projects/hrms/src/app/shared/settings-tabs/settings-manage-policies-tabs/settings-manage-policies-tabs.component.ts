import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-policies-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-policies-tabs.component.html',
  styleUrl: './settings-manage-policies-tabs.component.scss'
})

export class SettingsManagePoliciesTabsComponent {

  navLinks = [
    { label: 'Pending For Submission',route: '/settings/employee-fields/manage-policies/pending-for-submit'},
    { label: 'Published',route: '/settings/employee-fields/manage-policies/published-policies'}
  ];
}
