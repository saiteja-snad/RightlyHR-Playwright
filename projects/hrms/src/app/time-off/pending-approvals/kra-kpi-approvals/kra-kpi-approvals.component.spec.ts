import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KraKpiApprovalsComponent } from './kra-kpi-approvals.component';

describe('KraKpiApprovalsComponent', () => {
  let component: KraKpiApprovalsComponent;
  let fixture: ComponentFixture<KraKpiApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KraKpiApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KraKpiApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
