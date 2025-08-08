import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferLetterAcknowledgementComponent } from './offer-letter-acknowledgement.component';

describe('OfferLetterAcknowledgementComponent', () => {
  let component: OfferLetterAcknowledgementComponent;
  let fixture: ComponentFixture<OfferLetterAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferLetterAcknowledgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferLetterAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
