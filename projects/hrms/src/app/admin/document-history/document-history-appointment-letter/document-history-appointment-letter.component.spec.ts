import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentHistoryAppointmentLetterComponent } from './document-history-appointment-letter.component';

describe('DocumentHistoryAppointmentLetterComponent', () => {
  let component: DocumentHistoryAppointmentLetterComponent;
  let fixture: ComponentFixture<DocumentHistoryAppointmentLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentHistoryAppointmentLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentHistoryAppointmentLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
