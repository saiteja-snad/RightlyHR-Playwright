import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesWaitingForApprovalComponent } from './leaves-waiting-for-approval.component';

describe('LeavesWaitingForApprovalComponent', () => {
  let component: LeavesWaitingForApprovalComponent;
  let fixture: ComponentFixture<LeavesWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
