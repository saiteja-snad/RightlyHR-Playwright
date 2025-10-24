import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfWhfWaitingForApprovalComponent } from './on-behalf-of-whf-waiting-for-approval.component';

describe('OnBehalfOfWhfWaitingForApprovalComponent', () => {
  let component: OnBehalfOfWhfWaitingForApprovalComponent;
  let fixture: ComponentFixture<OnBehalfOfWhfWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfWhfWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfWhfWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
