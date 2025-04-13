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
    { label: 'Address', link: '/myinfo/personal/address-info' },
    { label: 'Contact', link: '/myinfo/personal/contact-details' },
    { label: 'Education', link: '/myinfo/personal/education-details' },
    { label: 'Identity', link: '/myinfo/personal/identity-details' },
    { label: 'Family', link: '/myinfo/personal/family-details' },
    { label: 'Bank', link: '/myinfo/personal/bank-details' }
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