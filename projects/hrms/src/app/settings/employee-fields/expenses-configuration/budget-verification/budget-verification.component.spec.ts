import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetVerificationComponent } from './budget-verification.component';

describe('BudgetVerificationComponent', () => {
  let component: BudgetVerificationComponent;
  let fixture: ComponentFixture<BudgetVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
