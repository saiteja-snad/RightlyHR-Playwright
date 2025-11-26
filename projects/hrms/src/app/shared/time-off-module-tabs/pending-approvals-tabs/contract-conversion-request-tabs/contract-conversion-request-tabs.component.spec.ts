import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractConversionRequestTabsComponent } from './contract-conversion-request-tabs.component';

describe('ContractConversionRequestTabsComponent', () => {
  let component: ContractConversionRequestTabsComponent;
  let fixture: ComponentFixture<ContractConversionRequestTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractConversionRequestTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractConversionRequestTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
