import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-letters-tab',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './letters-tab.component.html',
  styleUrl: './letters-tab.component.scss'
})

export class LettersTabComponent {
  navTabs = [
    {
      label: 'Offer Letter',
      link: '/letters/offer-letter',
      icon: '/letters-icon/offer-letter-icon.png',
      subject: MODULE_INFOS.OFFER_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' }
    },
    {
      label: 'Appointment Letter',
      link: '/letters/appointment-letter',
      icon: '/letters-icon/appointment-letter-icon.png',
      subject: MODULE_INFOS.APPOINTMENT_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' }
    },
    {
      label: 'Trainee Offer Letter',
      link: '/letters/trainee-offer-letter',
      icon: '/letters-icon/trainee-offer-letter-icon.png',
      subject: MODULE_INFOS.TRAINEE_OFFER_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' }
    },
    // {
    //   label: 'Trainee Appointment Letter',
    //   link: '/letters/trainee-appointment-letter',
    //   icon: '/letters-icon/trainee-appointment-letter.png',
    //   subject: MODULE_INFOS.TRAINEE_APPOINTMENT_LETTER_MODULE_INFO,
    //   permission: { feature: 'Dashboard Generate Documents Trainee Appointment Letter', action: 'view' }
    // },
    // {
    //   label: 'Welcome Letter',
    //   link: '/letters/welcome-letter',
    //   icon: '/letters-icon/welcome-letter-icon.png',
    //   subject: MODULE_INFOS.WELCOME_LETTER_MODULE_INFO,
    //   permission: { feature: 'Dashboard Generate Documents Welcome Letter', action: 'view' }
    // },
    {
      label: 'Bank Loan Letter',
      link: '/letters/bank-loan-letter',
      icon: '/letters-icon/bank-loan-letter-icon.png',
      subject: MODULE_INFOS.BANK_LOAN_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' }
    },
    {
      label: 'Address Proof Letter',
      link: '/letters/address-proof-letter',
      icon: '/letters-icon/address-proof-letter-icon.png',
      subject: MODULE_INFOS.ADDRESS_PROOF_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' }
    },
    {
      label: 'Appraisal Letter',
      link: '/letters/apprisal-letter',
      icon: '/letters-icon/appraisal-letter-icon.png',
      subject: MODULE_INFOS.APPRAISAL_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' }
    },
    {
      label: 'Promotion Letter',
      link: '/letters/promotion-letter',
      icon: '/letters-icon/promotion-letter.png',
      subject: MODULE_INFOS.PROMOTION_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Trainee Appointment Letter', action: 'view' }
    },
    {
      label: 'Salary Revision Letter',
      link: '/letters/salary-revision-letter',
      icon: '/letters-icon/salary-revision-letter-icon.png',
      subject: MODULE_INFOS.SALARY_REVISION_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Welcome Letter', action: 'view' }
    },
    {
      label: 'Relieving Letter',
      link: '/letters/relieving-letter',
      icon: '/letters-icon/reliveing-letter.png',
      subject: MODULE_INFOS.RELIEVING_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' }
    },
    {
      label: 'Probation Confirmation Letter',
      link: '/letters/probation-confirmation-letter',
      icon: '/letters-icon/probation-confirmation-letter.png',
      subject: MODULE_INFOS.PROBATION_CONFIRMATION_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' }
    },
    {
      label: 'Probation Extension Letter',
      link: '/letters/probation-extension-letter',
      icon: '/letters-icon/probation-extension-letter.png',
      subject: MODULE_INFOS.PROBATION_EXTENSION_LETTER_MODULE_INFO,
      permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' }
    },
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