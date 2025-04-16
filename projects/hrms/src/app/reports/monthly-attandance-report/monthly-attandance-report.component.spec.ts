import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAttandanceReportComponent } from './monthly-attandance-report.component';

describe('MonthlyAttandanceReportComponent', () => {
  let component: MonthlyAttandanceReportComponent;
  let fixture: ComponentFixture<MonthlyAttandanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyAttandanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyAttandanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
