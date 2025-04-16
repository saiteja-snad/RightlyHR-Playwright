import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationWaitingForApprovalComponent } from './regularization-waiting-for-approval.component';

describe('RegularizationWaitingForApprovalComponent', () => {
  let component: RegularizationWaitingForApprovalComponent;
  let fixture: ComponentFixture<RegularizationWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
