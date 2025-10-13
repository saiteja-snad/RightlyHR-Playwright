import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryContractOfferLetterComponent } from './document-history-contract-offer-letter.component';

describe('DocumentHistoryContractOfferLetterComponent', () => {
  let component: DocumentHistoryContractOfferLetterComponent;
  let fixture: ComponentFixture<DocumentHistoryContractOfferLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryContractOfferLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryContractOfferLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
