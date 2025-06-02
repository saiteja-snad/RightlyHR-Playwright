import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyAcknowledgementReportComponent } from './policy-acknowledgement-report.component';

describe('PolicyAcknowledgementReportComponent', () => {
  let component: PolicyAcknowledgementReportComponent;
  let fixture: ComponentFixture<PolicyAcknowledgementReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyAcknowledgementReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyAcknowledgementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
