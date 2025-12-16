import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesWaitingForApprovalComponent } from './on-behalf-of-expenses-waiting-for-approval.component';

describe('OnBehalfOfExpensesWaitingForApprovalComponent', () => {
  let component: OnBehalfOfExpensesWaitingForApprovalComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
