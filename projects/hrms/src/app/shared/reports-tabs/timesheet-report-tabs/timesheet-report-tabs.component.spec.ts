import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetReportTabsComponent } from './timesheet-report-tabs.component';

describe('TimesheetReportTabsComponent', () => {
  let component: TimesheetReportTabsComponent;
  let fixture: ComponentFixture<TimesheetReportTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetReportTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetReportTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
