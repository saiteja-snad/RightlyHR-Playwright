import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfExpensesApprovedComponent } from './on-behalf-of-expenses-approved.component';

describe('OnBehalfOfExpensesApprovedComponent', () => {
  let component: OnBehalfOfExpensesApprovedComponent;
  let fixture: ComponentFixture<OnBehalfOfExpensesApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfExpensesApprovedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfExpensesApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
