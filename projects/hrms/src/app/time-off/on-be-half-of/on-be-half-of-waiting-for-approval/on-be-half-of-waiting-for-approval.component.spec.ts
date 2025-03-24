import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBeHalfOfWaitingForApprovalComponent } from './on-be-half-of-waiting-for-approval.component';

describe('OnBeHalfOfWaitingForApprovalComponent', () => {
  let component: OnBeHalfOfWaitingForApprovalComponent;
  let fixture: ComponentFixture<OnBeHalfOfWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBeHalfOfWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBeHalfOfWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
