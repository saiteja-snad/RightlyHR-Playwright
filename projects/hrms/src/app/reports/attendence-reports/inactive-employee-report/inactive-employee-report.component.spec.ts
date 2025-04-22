import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveEmployeeReportComponent } from './inactive-employee-report.component';

describe('InactiveEmployeeReportComponent', () => {
  let component: InactiveEmployeeReportComponent;
  let fixture: ComponentFixture<InactiveEmployeeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveEmployeeReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveEmployeeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
