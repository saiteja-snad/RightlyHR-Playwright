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
    { label: 'Basic Information', link: '/myinfo/personal/basic-info', permission: { feature: 'Basic Information', action: 'view' } },
    { label: 'Address', link: '/myinfo/personal/address-info',permission: { feature: 'Current Address', action: 'view' } },
    { label: 'Contact', link: '/myinfo/personal/contact-details',permission: { feature: 'Contact Details', action: 'view' } },
    { label: 'Education', link: '/myinfo/personal/education-details',permission: { feature: 'Education', action: 'view' } },
    { label: 'Identity', link: '/myinfo/personal/identity-details',permission: { feature: 'Identity', action: 'view' } },
    { label: 'Family', link: '/myinfo/personal/family-details',permission: { feature: 'Family Details', action: 'view' } },
    { label: 'Bank', link: '/myinfo/personal/bank-details',permission: { feature: 'Bank Details', action: 'view' } }
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