import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveCarryForwardReportComponent } from './leave-carry-forward-report.component';

describe('LeaveCarryForwardReportComponent', () => {
  let component: LeaveCarryForwardReportComponent;
  let fixture: ComponentFixture<LeaveCarryForwardReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveCarryForwardReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveCarryForwardReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
