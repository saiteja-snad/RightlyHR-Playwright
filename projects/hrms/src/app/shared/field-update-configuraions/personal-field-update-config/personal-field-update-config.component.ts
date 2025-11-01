import { Component, OnInit } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-field-update-config',
  imports: [RouterModule, CommonModule],
  templateUrl: './personal-field-update-config.component.html',
  styleUrl: './personal-field-update-config.component.scss'
})
export class PersonalFieldUpdateConfigComponent implements OnInit {
  filteredTabs: any[] = [];

  allNavLinks = [
    { label: 'Basic Info', route: '/settings/employee-fields-update-configurations/personal/basic-info', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Contact Info', route: '/settings/employee-fields-update-configurations/personal/contact-info', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Addresses', route: '/settings/employee-fields-update-configurations/personal/addresses', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Emergency Contacts', route: '/settings/employee-fields-update-configurations/personal/emergency-contacts', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Family Members', route: '/settings/employee-fields-update-configurations/personal/family-members', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Identity Info', route: '/settings/employee-fields-update-configurations/personal/identity-info', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Bank Info', route: '/settings/employee-fields-update-configurations/personal/bank-info', permission: { feature: 'Salutation', action: 'view' } },
    { label: 'Academics', route: '/settings/employee-fields-update-configurations/personal/academics', permission: { feature: 'Salutation', action: 'view' } },
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.allNavLinks.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}