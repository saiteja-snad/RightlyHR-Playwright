import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryInternAppointmentComponent } from './document-history-intern-appointment.component';

describe('DocumentHistoryInternAppointmentComponent', () => {
  let component: DocumentHistoryInternAppointmentComponent;
  let fixture: ComponentFixture<DocumentHistoryInternAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryInternAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryInternAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
