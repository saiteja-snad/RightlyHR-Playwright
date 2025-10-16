import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractConversionComponent } from './contract-conversion.component';

describe('ContractConversionComponent', () => {
  let component: ContractConversionComponent;
  let fixture: ComponentFixture<ContractConversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractConversionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
