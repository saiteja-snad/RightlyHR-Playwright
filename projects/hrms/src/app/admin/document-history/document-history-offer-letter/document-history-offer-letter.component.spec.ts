import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryOfferLetterComponent } from './document-history-offer-letter.component';

describe('DocumentHistoryOfferLetterComponent', () => {
  let component: DocumentHistoryOfferLetterComponent;
  let fixture: ComponentFixture<DocumentHistoryOfferLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryOfferLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryOfferLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
