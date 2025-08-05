import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentLetterAcknowledgementComponent } from './appointment-letter-acknowledgement.component';

describe('AppointmentLetterAcknowledgementComponent', () => {
  let component: AppointmentLetterAcknowledgementComponent;
  let fixture: ComponentFixture<AppointmentLetterAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentLetterAcknowledgementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentLetterAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
