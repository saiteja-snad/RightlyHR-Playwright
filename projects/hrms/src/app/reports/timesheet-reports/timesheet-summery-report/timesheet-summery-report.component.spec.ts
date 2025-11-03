import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetSummeryReportComponent } from './timesheet-summery-report.component';

describe('TimesheetSummeryReportComponent', () => {
  let component: TimesheetSummeryReportComponent;
  let fixture: ComponentFixture<TimesheetSummeryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetSummeryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetSummeryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
