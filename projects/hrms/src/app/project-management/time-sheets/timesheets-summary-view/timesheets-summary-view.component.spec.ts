import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsSummaryViewComponent } from './timesheets-summary-view.component';

describe('TimesheetsSummaryViewComponent', () => {
  let component: TimesheetsSummaryViewComponent;
  let fixture: ComponentFixture<TimesheetsSummaryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetsSummaryViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsSummaryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
