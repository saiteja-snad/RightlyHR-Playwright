import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractForYouComponent } from './contract-for-you.component';

describe('ContractForYouComponent', () => {
  let component: ContractForYouComponent;
  let fixture: ComponentFixture<ContractForYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractForYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractForYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
