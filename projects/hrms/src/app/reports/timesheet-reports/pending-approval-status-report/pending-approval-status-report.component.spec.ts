import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingApprovalStatusReportComponent } from './pending-approval-status-report.component';

describe('PendingApprovalStatusReportComponent', () => {
  let component: PendingApprovalStatusReportComponent;
  let fixture: ComponentFixture<PendingApprovalStatusReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingApprovalStatusReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingApprovalStatusReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
