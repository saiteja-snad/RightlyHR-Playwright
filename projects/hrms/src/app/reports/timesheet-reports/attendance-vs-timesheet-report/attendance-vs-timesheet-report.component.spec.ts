import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceVsTimesheetReportComponent } from './attendance-vs-timesheet-report.component';

describe('AttendanceVsTimesheetReportComponent', () => {
  let component: AttendanceVsTimesheetReportComponent;
  let fixture: ComponentFixture<AttendanceVsTimesheetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceVsTimesheetReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceVsTimesheetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
