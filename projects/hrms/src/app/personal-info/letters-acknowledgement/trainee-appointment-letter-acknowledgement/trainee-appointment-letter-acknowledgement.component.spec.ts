import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeAppointmentLetterAcknowledgementComponent } from './trainee-appointment-letter-acknowledgement.component';

describe('TraineeAppointmentLetterAcknowledgementComponent', () => {
  let component: TraineeAppointmentLetterAcknowledgementComponent;
  let fixture: ComponentFixture<TraineeAppointmentLetterAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeAppointmentLetterAcknowledgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeAppointmentLetterAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
