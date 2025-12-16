import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesCancellationComponent } from './on-behalf-of-expenses-cancellation.component';

describe('OnBehalfOfExpensesCancellationComponent', () => {
  let component: OnBehalfOfExpensesCancellationComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesCancellationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
