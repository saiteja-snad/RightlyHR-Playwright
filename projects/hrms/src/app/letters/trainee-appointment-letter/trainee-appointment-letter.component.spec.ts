import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeAppointmentLetterComponent } from './trainee-appointment-letter.component';

describe('TraineeAppointmentLetterComponent', () => {
  let component: TraineeAppointmentLetterComponent;
  let fixture: ComponentFixture<TraineeAppointmentLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeAppointmentLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeAppointmentLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
