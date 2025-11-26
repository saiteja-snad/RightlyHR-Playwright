import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveContractEmployeesComponent } from './inactive-contract-employees.component';

describe('InactiveContractEmployeesComponent', () => {
  let component: InactiveContractEmployeesComponent;
  let fixture: ComponentFixture<InactiveContractEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveContractEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactiveContractEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
