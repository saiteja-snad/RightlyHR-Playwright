import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesProcessedComponent } from './on-behalf-of-expenses-processed.component';

describe('OnBehalfOfExpensesProcessedComponent', () => {
  let component: OnBehalfOfExpensesProcessedComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesProcessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesProcessedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesProcessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
