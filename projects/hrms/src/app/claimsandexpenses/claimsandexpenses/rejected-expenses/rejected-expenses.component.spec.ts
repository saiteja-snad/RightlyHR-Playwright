import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedExpensesComponent } from './rejected-expenses.component';

describe('RejectedExpensesComponent', () => {
  let component: RejectedExpensesComponent;
  let fixture: ComponentFixture<RejectedExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
