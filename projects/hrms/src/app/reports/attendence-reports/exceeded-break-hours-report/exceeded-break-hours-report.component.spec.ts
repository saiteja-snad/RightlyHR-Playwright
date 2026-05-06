import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceededBreakHoursReportComponent } from './exceeded-break-hours-report.component';

describe('ExceededBreakHoursReportComponent', () => {
  let component: ExceededBreakHoursReportComponent;
  let fixture: ComponentFixture<ExceededBreakHoursReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExceededBreakHoursReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExceededBreakHoursReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
