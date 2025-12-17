import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeKraKpiViewComponent } from './employee-kra-kpi-view.component';

describe('EmployeeKraKpiViewComponent', () => {
  let component: EmployeeKraKpiViewComponent;
  let fixture: ComponentFixture<EmployeeKraKpiViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeKraKpiViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeKraKpiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
