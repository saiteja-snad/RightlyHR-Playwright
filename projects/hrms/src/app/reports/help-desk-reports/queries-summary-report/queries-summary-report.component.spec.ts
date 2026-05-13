import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesSummaryReportComponent } from './queries-summary-report.component';

describe('QueriesSummaryReportComponent', () => {
  let component: QueriesSummaryReportComponent;
  let fixture: ComponentFixture<QueriesSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueriesSummaryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueriesSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
