import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DocumentHistoryOfferLetterComponent } from "../document-history-offer-letter/document-history-offer-letter.component";
import { DocumentHistoryInternOfferLetterComponent } from "../document-history-intern-offer-letter/document-history-intern-offer-letter.component";
import { DocumentHistoryAppointmentLetterComponent } from "../document-history-appointment-letter/document-history-appointment-letter.component";

@Component({
  selector: 'app-document-history-layout',
  imports: [CommonModule, NgbNavModule, DocumentHistoryOfferLetterComponent, DocumentHistoryInternOfferLetterComponent, DocumentHistoryAppointmentLetterComponent],
  templateUrl: './document-history-layout.component.html',
  styleUrl: './document-history-layout.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class DocumentHistoryLayoutComponent {
  active = 1;
}