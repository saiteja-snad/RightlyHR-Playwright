import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../modules-info';
import { ModuleInformationComponent } from "../../module-information/module-information.component";
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-letters-info',
  imports: [CommonModule, TranslateModule, ModuleInformationComponent, NgbPopoverModule],
  templateUrl: './letters-info.component.html',
  styleUrl: './letters-info.component.scss'
})

export class LettersInfoComponent {
  moduleinfo: string = '';
  componentname: string = '';
  routeToInfoMap!: { [key: string]: string };

  constructor(public router: Router, public rbac: RbacService) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.ComponentnameDisplay();
    this.routeToInfoMap = {
      '/letters/offer-letter': MODULE_INFOS.OFFER_LETTER_MODULE_INFO,
      '/letters/appointment-letter': MODULE_INFOS.APPOINTMENT_LETTER_MODULE_INFO,
      '/letters/trainee-offer-letter': MODULE_INFOS.TRAINEE_OFFER_LETTER_MODULE_INFO,
      '/letters/trainee-appointment-letter': MODULE_INFOS.TRAINEE_APPOINTMENT_LETTER_MODULE_INFO,
      '/letters/welcome-letter': MODULE_INFOS.WELCOME_LETTER_MODULE_INFO,
      '/letters/bank-loan-letter': MODULE_INFOS.BANK_LOAN_LETTER_MODULE_INFO,
      '/letters/address-proof-letter': MODULE_INFOS.ADDRESS_PROOF_LETTER_MODULE_INFO,
      '/letters/apprisal-letter': MODULE_INFOS.APPRAISAL_LETTER_MODULE_INFO,
      '/letters/promotion-letter': MODULE_INFOS.PROMOTION_LETTER_MODULE_INFO,
      '/letters/salary-revision-letter': MODULE_INFOS.SALARY_REVISION_LETTER_MODULE_INFO,
      '/letters/relieving-letter': MODULE_INFOS.RELIEVING_LETTER_MODULE_INFO,
      '/letters/probation-confirmation-letter': MODULE_INFOS.PROBATION_CONFIRMATION_LETTER_MODULE_INFO,
      '/letters/probation-extension-letter': MODULE_INFOS.PROBATION_EXTENSION_LETTER_MODULE_INFO,
    };
    const matchedEntry = Object.entries(this.routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  ComponentnameDisplay() {
    if (this.router.url === '/letters/offer-letter') {
      this.componentname = 'Offer Letter';
    }
    else if (this.router.url === '/letters/appointment-letter') {
      this.componentname = 'Appointment Letter';
    }
    else if (this.router.url === '/letters/trainee-offer-letter') {
      this.componentname = 'Trainee Offer letter';
    }
    else if (this.router.url === '/letters/trainee-appointment-letter') {
      this.componentname = 'Trainee Appointment letter';
    }
    else if (this.router.url === '/letters/welcome-letter') {
      this.componentname = 'Welcome Letter';
    }
    else if (this.router.url === '/letters/bank-loan-letter') {
      this.componentname = 'Bank Loan letter';
    }
    else if (this.router.url === '/letters/address-proof-letter') {
      this.componentname = 'Address proof letter';
    }
    else if (this.router.url === '/letters/apprisal-letter') {
      this.componentname = 'Apprisal Letter';
    }
    else if (this.router.url === '/letters/promotion-letter') {
      this.componentname = 'Promotion Letter';
    }
    else if (this.router.url === '/letters/salary-revision-letter') {
      this.componentname = 'Salary Revision Letter';
    }
    else if (this.router.url === '/letters/relieving-letter') {
      this.componentname = 'Relieving Letter';
    }
    else if (this.router.url === '/letters/probation-confirmation-letter') {
      this.componentname = 'Probation Confirmation Letter';
    }
    else if (this.router.url === '/letters/probation-extension-letter') {
      this.componentname = 'Probation Extension Letter';
    }
  }

  navigateEmployeeManagement() {
    this.router.navigate(['/employee-management']);
  }

  navigateletterTabs() {
    this.router.navigate(['/letters/lettes-tabs']);
  }
}