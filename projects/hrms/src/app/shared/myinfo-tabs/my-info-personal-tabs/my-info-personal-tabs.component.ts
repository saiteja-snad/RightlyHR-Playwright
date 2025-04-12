import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-my-info-personal-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './my-info-personal-tabs.component.html',
  styleUrl: './my-info-personal-tabs.component.scss'
})
export class MyInfoPersonalTabsComponent implements OnInit{

  filteredTabs: any[] = [];

 constructor(public rbac: RbacService) {}

  navTabs: any[] = [
    { label: 'Basic Information', link: '/myinfo/personal/basic-info', permission: { feature: 'Basic Information', action: 'view' } },
    { label: 'Address', link: '/myinfo/personal/address-info', permission: { feature: 'Address', action: 'view' } },
    { label: 'Contact', link: '/myinfo/personal/contact-details', permission: { feature: 'Contact', action: 'view' } },
    { label: 'Emergency Contact', link: '/myinfo/personal/emergency-contact-details', permission: { feature: 'Emergency Contact', action: 'view' } },
    { label: 'Education', link: '/myinfo/personal/education-details', permission: { feature: 'Education', action: 'view' } },
    { label: 'Identity', link: '/myinfo/personal/identity-details', permission: { feature: 'Identity', action: 'view' } },
    { label: 'Family', link: '/myinfo/personal/family-details', permission: { feature: 'Family', action: 'view' } },
    { label: 'Bank', link: '/myinfo/personal/bank-details', permission: { feature: 'Bank', action: 'view' } }
  ];

  ngOnInit(): void {
    this.filterTabsByRbac(); // 🔹 This is where you are calling the permission check
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;

      const permissionString = `${tab.permission.feature}.${tab.permission.action}`;
      return this.rbac.allowedToAccess(permissionString); // 🔹 Actual permission check
    });
  }
  
}
