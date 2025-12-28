import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesRejectedComponent } from './on-behalf-of-expenses-rejected.component';

describe('OnBehalfOfExpensesRejectedComponent', () => {
  let component: OnBehalfOfExpensesRejectedComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesRejectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesRejectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
