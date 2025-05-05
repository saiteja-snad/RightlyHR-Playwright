import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-my-info-personal-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './my-info-personal-tabs.component.html',
  styleUrl: './my-info-personal-tabs.component.scss'
})

export class MyInfoPersonalTabsComponent implements OnInit {
  filteredTabs: any[] = [];

  navTabs: any[] = [
    { label: 'Basic Information', link: '/myinfo/personal/basic-info', permission: { feature: 'My Info Basic Information', action: 'view' } },
    { label: 'Address Details', link: '/myinfo/personal/address-info',permission: { feature: 'My Info Address Details', action: 'view' } },
    { label: 'Contact Details', link: '/myinfo/personal/contact-details',permission: { feature: 'My Info Contact Details', action: 'view' } },
    { label: 'Emergency Contact Details', link: '/myinfo/personal/emergency-contact-details',permission: { feature: 'My Info Emergency Contact Details', action: 'view' } },
    { label: 'Education Details', link: '/myinfo/personal/education-details',permission: { feature: 'My Info Education Details', action: 'view' } },
    { label: 'Identity Details', link: '/myinfo/personal/identity-details',permission: { feature: 'My Info Identity Details', action: 'view' } },
    { label: 'Family Details', link: '/myinfo/personal/family-details',permission: { feature: 'My Info Family Details', action: 'view' } },
    { label: 'Bank Details', link: '/myinfo/personal/bank-details',permission: { feature: 'My Info Bank Details', action: 'view' } },
    { label: 'Visa Details', link: '/myinfo/personal/visa-details',permission: { feature: 'My Info Visa Details', action: 'view' } },

  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}