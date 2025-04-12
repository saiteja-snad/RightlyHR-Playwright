import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesAllowedDaysComponent } from './expenses-allowed-days.component';

describe('ExpensesAllowedDaysComponent', () => {
  let component: ExpensesAllowedDaysComponent;
  let fixture: ComponentFixture<ExpensesAllowedDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesAllowedDaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesAllowedDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
