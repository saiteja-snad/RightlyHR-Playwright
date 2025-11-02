import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesLimitComponent } from './expenses-limit.component';

describe('ExpensesLimitComponent', () => {
  let component: ExpensesLimitComponent;
  let fixture: ComponentFixture<ExpensesLimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesLimitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesLimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
