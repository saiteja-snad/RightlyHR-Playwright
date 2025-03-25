import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessedExpensesComponent } from './processed-expenses.component';

describe('ProcessedExpensesComponent', () => {
  let component: ProcessedExpensesComponent;
  let fixture: ComponentFixture<ProcessedExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessedExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessedExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
