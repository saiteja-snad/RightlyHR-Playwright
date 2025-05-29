import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-letters-tab',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './letters-tab.component.html',
  styleUrl: './letters-tab.component.scss'
})

export class LettersTabComponent {
  navTabs = [
    { label: 'Offer Letter', link: '/letters/offer-letter', permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' } },
    { label: 'Appointment Letter', link: '/letters/appointment-letter', permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' } },
    { label: 'Trainee Offer Letter', link: '/letters/trainee-offer-letter', permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' } },
    { label: 'Trainee Appointment Letter', link: '/letters/trainee-appointment-letter', permission: { feature: 'Dashboard Generate Documents Trainee Appointment Letter', action: 'view' } },
    { label: 'Welcome Letter', link: '/letters/welcome-letter', permission: { feature: 'Dashboard Generate Documents Welcome Letter', action: 'view' } },
    { label: 'Bank Loan Letter', link: '/letters/bank-loan-letter', permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' } },
    { label: 'Address Proof Letter', link: '/letters/address-proof-letter', permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' } },
    { label: 'Apprisal Letter', link: '/letters/apprisal-letter', permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' } },
    { label: 'Promotion Letter', link: '/letters/promotion-letter', permission: { feature: 'Dashboard Generate Documents Trainee Appointment Letter', action: 'view' } },
    { label: 'Salary Revision Letter', link: '/letters/salary-revision-letter', permission: { feature: 'Dashboard Generate Documents Welcome Letter', action: 'view' } },
    { label: 'Relieving Letter', link: '/letters/relieving-letter', permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' } },
    { label: 'Probation Confirmation Letter', link: '/letters/probation-confirmation-letter', permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' } },
    { label: 'Probation Extension Letter', link: '/letters/probation-extension-letter', permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' } },
  ];

  constructor(private rbac: RbacService) { }

  ngOnInit(): void {
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }
}