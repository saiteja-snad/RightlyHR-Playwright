import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryInternOfferLetterComponent } from './document-history-intern-offer-letter.component';

describe('DocumentHistoryInternOfferLetterComponent', () => {
  let component: DocumentHistoryInternOfferLetterComponent;
  let fixture: ComponentFixture<DocumentHistoryInternOfferLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryInternOfferLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryInternOfferLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
