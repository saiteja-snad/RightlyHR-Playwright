import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractConversionForYouComponent } from './contract-conversion-for-you.component';

describe('ContractConversionForYouComponent', () => {
  let component: ContractConversionForYouComponent;
  let fixture: ComponentFixture<ContractConversionForYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractConversionForYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractConversionForYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
