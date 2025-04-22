import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-personal-personal-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './personal-personal-tabs.component.html',
  styleUrl: './personal-personal-tabs.component.scss'
})

export class PersonalPersonalTabsComponent {
  navTabs: any[] = [
    { label: 'Basic Information', link: '/personalinfo/personal/basic-info', permission: { feature: 'Employee Basic Information', action: 'view' } },
    { label: 'Documents Verification', link: '/personalinfo/personal/onboarding-verification',permission: { feature: 'Employee Onboarding Documents', action: 'view' } },
    { label: 'Address', link: '/personalinfo/personal/address-info',permission: { feature: 'Employee Current Address', action: 'view' } },
    { label: 'Contact', link: '/personalinfo/personal/contact-details',permission: { feature: 'Employee Contact Details', action: 'view' } },
    { label: 'Emergency Contact', link: '/personalinfo/personal/emergency-contact-details' ,permission: { feature: 'Employee Emergency Contact Details', action: 'view' }},
    { label: 'Education', link: '/personalinfo/personal/education-details' ,permission: { feature: 'Employee Education', action: 'view' }},
    { label: 'Identity', link: '/personalinfo/personal/identity-details' ,permission: { feature: 'Employee Identity', action: 'view' }},
    { label: 'Family', link: '/personalinfo/personal/family-details',permission: { feature: 'Employee Family Details', action: 'view' } },
    { label: 'Bank', link: '/personalinfo/personal/bank-details',permission: { feature: 'Employee Bank Details', action: 'view' } }
  ];
}