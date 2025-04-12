import { Component } from '@angular/core';
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
export class MyInfoPersonalTabsComponent {

  constructor(
    public rbac: RbacService
  ){}

  navTabs: any[] = [
    { label: 'Basic Information', link: '/myinfo/personal/basic-info', permission: { module: 'My Info', feature: 'Basic Information', action: 'view' } },
    { label: 'Address', link: '/myinfo/personal/address-info' },
    { label: 'Contact', link: '/myinfo/personal/contact-details' },
    { label: 'Emergency Contact', link: '/myinfo/personal/emergency-contact-details' },
    { label: 'Education', link: '/myinfo/personal/education-details' },
    { label: 'Identity', link: '/myinfo/personal/identity-details' },
    { label: 'Family', link: '/myinfo/personal/family-details' },
    { label: 'Bank', link: '/myinfo/personal/bank-details' }
  ];
  
  
}
