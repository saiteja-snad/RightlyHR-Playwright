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
    { label: 'Basic Information', link: '/personalinfo/personal/basic-info', permission: { module: 'My Info', feature: 'Basic Information', action: 'view' } },
    { label: ' Documents Verification', link: '/personalinfo/personal/onboarding-verification' },
    { label: 'Address', link: '/personalinfo/personal/address-info' },
    { label: 'Contact', link: '/personalinfo/personal/contact-details' },
    { label: 'Emergency Contact', link: '/personalinfo/personal/emergency-contact-details' },
    { label: 'Education', link: '/personalinfo/personal/education-details' },
    { label: 'Identity', link: '/personalinfo/personal/identity-details' },
    { label: 'Family', link: '/personalinfo/personal/family-details' },
    { label: 'Bank', link: '/personalinfo/personal/bank-details' }
  ];
  
}
