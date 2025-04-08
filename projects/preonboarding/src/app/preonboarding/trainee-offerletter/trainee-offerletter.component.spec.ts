import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeOfferletterComponent } from './trainee-offerletter.component';

describe('TraineeOfferletterComponent', () => {
  let component: TraineeOfferletterComponent;
  let fixture: ComponentFixture<TraineeOfferletterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeOfferletterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeOfferletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
