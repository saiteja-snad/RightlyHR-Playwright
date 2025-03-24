import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeOfferLetterComponent } from './trainee-offer-letter.component';

describe('TraineeOfferLetterComponent', () => {
  let component: TraineeOfferLetterComponent;
  let fixture: ComponentFixture<TraineeOfferLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeOfferLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeOfferLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
