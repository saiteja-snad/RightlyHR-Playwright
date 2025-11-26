import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizationReportComponent } from './utilization-report.component';

describe('UtilizationReportComponent', () => {
  let component: UtilizationReportComponent;
  let fixture: ComponentFixture<UtilizationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizationReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
