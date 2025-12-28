import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KraKpiManagementLayoutComponent } from './kra-kpi-management-layout.component';

describe('KraKpiManagementLayoutComponent', () => {
  let component: KraKpiManagementLayoutComponent;
  let fixture: ComponentFixture<KraKpiManagementLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KraKpiManagementLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KraKpiManagementLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
