import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractEmployeeComponent } from './add-contract-employee.component';

describe('AddContractEmployeeComponent', () => {
  let component: AddContractEmployeeComponent;
  let fixture: ComponentFixture<AddContractEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContractEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContractEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
