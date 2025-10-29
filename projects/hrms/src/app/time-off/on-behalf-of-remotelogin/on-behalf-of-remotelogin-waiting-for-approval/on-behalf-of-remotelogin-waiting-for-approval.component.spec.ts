import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBehalfOfRemoteloginWaitingForApprovalComponent } from './on-behalf-of-remotelogin-waiting-for-approval.component';

describe('OnBehalfOfRemoteloginWaitingForApprovalComponent', () => {
  let component: OnBehalfOfRemoteloginWaitingForApprovalComponent;
  let fixture: ComponentFixture<OnBehalfOfRemoteloginWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnBehalfOfRemoteloginWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnBehalfOfRemoteloginWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
