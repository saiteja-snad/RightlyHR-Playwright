import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractConversionForYourRoleComponent } from './contract-conversion-for-your-role.component';

describe('ContractConversionForYourRoleComponent', () => {
  let component: ContractConversionForYourRoleComponent;
  let fixture: ComponentFixture<ContractConversionForYourRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractConversionForYourRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractConversionForYourRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
