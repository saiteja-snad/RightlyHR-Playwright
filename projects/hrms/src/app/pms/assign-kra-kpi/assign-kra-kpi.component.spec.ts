import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignKraKpiComponent } from './assign-kra-kpi.component';

describe('AssignKraKpiComponent', () => {
  let component: AssignKraKpiComponent;
  let fixture: ComponentFixture<AssignKraKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignKraKpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignKraKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
