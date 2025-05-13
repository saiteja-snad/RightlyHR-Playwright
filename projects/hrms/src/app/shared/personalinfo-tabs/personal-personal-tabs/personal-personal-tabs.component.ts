import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-personal-personal-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './personal-personal-tabs.component.html',
  styleUrl: './personal-personal-tabs.component.scss'
})

export class PersonalPersonalTabsComponent {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { label: 'Basic Information', link: '/personalinfo/personal/basic-info', permission: { feature: 'Employee Info Basic Information', action: 'view' } },
    { label: 'Documents Verification', link: '/personalinfo/personal/onboarding-verification',permission: { feature: 'Employee Info Documents Verification', action: 'view' } },
    { label: 'Address Details', link: '/personalinfo/personal/address-info',permission: { feature: 'Employee Info Address Details', action: 'view' } },
    { label: 'Contact Details', link: '/personalinfo/personal/contact-details',permission: { feature: 'Employee Info Contact Details', action: 'view' } },
    { label: 'Emergency Contact Details', link: '/personalinfo/personal/emergency-contact-details' ,permission: { feature: 'Employee Info Emergency Contact Details', action: 'view' }},
    { label: 'Education Details', link: '/personalinfo/personal/education-details' ,permission: { feature: 'Employee Info Education Details', action: 'view' }},
    { label: 'Identity Details', link: '/personalinfo/personal/identity-details' ,permission: { feature: 'Employee Info Identity Details', action: 'view' }},
    { label: 'Family Details', link: '/personalinfo/personal/family-details',permission: { feature: 'Employee Info Family Details', action: 'view' } },
    { label: 'Bank Details', link: '/personalinfo/personal/bank-details',permission: { feature: 'Employee Info Bank Details', action: 'view' } },
    { label: 'Visa Details', link: '/personalinfo/personal/visa-details',permission: { feature: 'Employee Info Visa Details', action: 'view' }}
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