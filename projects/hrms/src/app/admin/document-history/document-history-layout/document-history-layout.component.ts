import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DocumentHistoryOfferLetterComponent } from "../document-history-offer-letter/document-history-offer-letter.component";
import { DocumentHistoryInternOfferLetterComponent } from "../document-history-intern-offer-letter/document-history-intern-offer-letter.component";
import { DocumentHistoryAppointmentLetterComponent } from "../document-history-appointment-letter/document-history-appointment-letter.component";
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from "../../../shared/sidetabsloaders/sidetabsloaders.component";
import { DocumentHistoryNdaLetterComponent } from "../document-history-nda-letter/document-history-nda-letter.component";
import { DocumentHistoryContractOfferLetterComponent } from "../document-history-contract-offer-letter/document-history-contract-offer-letter.component";

@Component({
  selector: 'app-document-history-layout',
  imports: [CommonModule, NgbNavModule, DocumentHistoryOfferLetterComponent, DocumentHistoryInternOfferLetterComponent, DocumentHistoryAppointmentLetterComponent, SidetabsloadersComponent, DocumentHistoryNdaLetterComponent, DocumentHistoryContractOfferLetterComponent],
  templateUrl: './document-history-layout.component.html',
  styleUrl: './document-history-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class DocumentHistoryLayoutComponent {
  // active = 1;
  constructor(public rbac: RbacService) { }
  active!: string;

  ngOnInit() {
    if (this.rbac.allowedToAccess('Documents History Offer Letter.view')) {
      this.active = 'offer';
    } else if (this.rbac.allowedToAccess('Documents History Contract Offer Letter.view')) {
      this.active = 'contract-offer';
    }  else if (this.rbac.allowedToAccess('Documents History Appointment Letter.view')) {
      this.active = 'appointment';
    } else if (this.rbac.allowedToAccess('Documents History Trainee Offer Letter.view')) {
      this.active = 'trainee-offer';
    }else if (this.rbac.allowedToAccess('Documents History Non-Disclosure Agreement Letter.view')) {
      this.active = 'nda-letter';
    }
  }

}