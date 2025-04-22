import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlySummaryReportComponent } from './yearly-summary-report.component';

describe('YearlySummaryReportComponent', () => {
  let component: YearlySummaryReportComponent;
  let fixture: ComponentFixture<YearlySummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlySummaryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlySummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
