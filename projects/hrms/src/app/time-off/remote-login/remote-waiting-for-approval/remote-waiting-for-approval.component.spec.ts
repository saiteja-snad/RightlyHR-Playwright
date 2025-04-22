import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteWaitingForApprovalComponent } from './remote-waiting-for-approval.component';

describe('RemoteWaitingForApprovalComponent', () => {
  let component: RemoteWaitingForApprovalComponent;
  let fixture: ComponentFixture<RemoteWaitingForApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteWaitingForApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteWaitingForApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
