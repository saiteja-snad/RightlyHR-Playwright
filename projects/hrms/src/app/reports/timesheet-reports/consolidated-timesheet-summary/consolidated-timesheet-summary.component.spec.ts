import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidatedTimesheetSummaryComponent } from './consolidated-timesheet-summary.component';

describe('ConsolidatedTimesheetSummaryComponent', () => {
  let component: ConsolidatedTimesheetSummaryComponent;
  let fixture: ComponentFixture<ConsolidatedTimesheetSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsolidatedTimesheetSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsolidatedTimesheetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
