import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KraKpiDashboardComponent } from './kra-kpi-dashboard.component';

describe('KraKpiDashboardComponent', () => {
  let component: KraKpiDashboardComponent;
  let fixture: ComponentFixture<KraKpiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KraKpiDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KraKpiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
