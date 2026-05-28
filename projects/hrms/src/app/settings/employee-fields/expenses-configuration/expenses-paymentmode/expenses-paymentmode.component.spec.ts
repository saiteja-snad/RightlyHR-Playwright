import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesPaymentmodeComponent } from './expenses-paymentmode.component';

describe('ExpensesPaymentmodeComponent', () => {
  let component: ExpensesPaymentmodeComponent;
  let fixture: ComponentFixture<ExpensesPaymentmodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesPaymentmodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesPaymentmodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
