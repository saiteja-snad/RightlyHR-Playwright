import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-shits-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-manage-shits-tabs.component.html',
  styleUrl: './settings-manage-shits-tabs.component.scss',
})

export class SettingsManageShitsTabsComponent {

  navLinks = [
    { label: 'Pending For Submit',route: '/settings/employee-fields/manage-shifts/pending-for-submit'},
    { label: 'Published Shifts',route: '/settings/employee-fields/manage-shifts/published-shifts'}
  ];
  
}
