import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingExpensesComponent } from './pending-expenses.component';

describe('PendingExpensesComponent', () => {
  let component: PendingExpensesComponent;
  let fixture: ComponentFixture<PendingExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
