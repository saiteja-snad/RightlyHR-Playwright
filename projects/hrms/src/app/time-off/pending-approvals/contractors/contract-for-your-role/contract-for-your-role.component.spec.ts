import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractForYourRoleComponent } from './contract-for-your-role.component';

describe('ContractForYourRoleComponent', () => {
  let component: ContractForYourRoleComponent;
  let fixture: ComponentFixture<ContractForYourRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractForYourRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractForYourRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
