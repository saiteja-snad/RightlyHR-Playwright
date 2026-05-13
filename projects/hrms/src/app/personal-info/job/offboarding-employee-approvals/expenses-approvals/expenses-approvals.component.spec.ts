import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesApprovalsComponent } from './expenses-approvals.component';

describe('ExpensesApprovalsComponent', () => {
  let component: ExpensesApprovalsComponent;
  let fixture: ComponentFixture<ExpensesApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
