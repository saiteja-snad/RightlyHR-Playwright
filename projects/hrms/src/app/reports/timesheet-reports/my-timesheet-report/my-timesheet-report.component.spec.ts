import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTimesheetReportComponent } from './my-timesheet-report.component';

describe('MyTimesheetReportComponent', () => {
  let component: MyTimesheetReportComponent;
  let fixture: ComponentFixture<MyTimesheetReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTimesheetReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTimesheetReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
