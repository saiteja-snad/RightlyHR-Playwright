import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSummaryReportComponent } from './leave-summary-report.component';

describe('LeaveSummaryReportComponent', () => {
  let component: LeaveSummaryReportComponent;
  let fixture: ComponentFixture<LeaveSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveSummaryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
