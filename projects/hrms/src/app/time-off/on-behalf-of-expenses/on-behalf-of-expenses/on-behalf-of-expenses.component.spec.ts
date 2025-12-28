import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesComponent } from './on-behalf-of-expenses.component';

describe('OnBehalfOfExpensesComponent', () => {
  let component: OnBehalfOfExpensesComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
