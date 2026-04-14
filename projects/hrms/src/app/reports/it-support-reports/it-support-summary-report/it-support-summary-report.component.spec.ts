import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItSupportSummaryReportComponent } from './it-support-summary-report.component';

describe('ItSupportSummaryReportComponent', () => {
  let component: ItSupportSummaryReportComponent;
  let fixture: ComponentFixture<ItSupportSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItSupportSummaryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItSupportSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
