import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteloginApprovalTabsComponent } from './remotelogin-approval-tabs.component';

describe('RemoteloginApprovalTabsComponent', () => {
  let component: RemoteloginApprovalTabsComponent;
  let fixture: ComponentFixture<RemoteloginApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteloginApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteloginApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
