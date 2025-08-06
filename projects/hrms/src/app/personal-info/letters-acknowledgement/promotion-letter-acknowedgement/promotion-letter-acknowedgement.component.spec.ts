import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionLetterAcknowedgementComponent } from './promotion-letter-acknowedgement.component';

describe('PromotionLetterAcknowedgementComponent', () => {
  let component: PromotionLetterAcknowedgementComponent;
  let fixture: ComponentFixture<PromotionLetterAcknowedgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionLetterAcknowedgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionLetterAcknowedgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
