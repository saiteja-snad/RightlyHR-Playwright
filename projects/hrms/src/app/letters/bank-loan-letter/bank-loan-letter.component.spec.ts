import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankLoanLetterComponent } from './bank-loan-letter.component';

describe('BankLoanLetterComponent', () => {
  let component: BankLoanLetterComponent;
  let fixture: ComponentFixture<BankLoanLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankLoanLetterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankLoanLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
