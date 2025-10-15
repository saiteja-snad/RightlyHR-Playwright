import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveContractEmployeesComponent } from './active-contract-employees.component';

describe('ActiveContractEmployeesComponent', () => {
  let component: ActiveContractEmployeesComponent;
  let fixture: ComponentFixture<ActiveContractEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveContractEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveContractEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
