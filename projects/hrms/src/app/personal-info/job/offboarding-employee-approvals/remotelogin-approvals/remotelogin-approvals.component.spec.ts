import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteloginApprovalsComponent } from './remotelogin-approvals.component';

describe('RemoteloginApprovalsComponent', () => {
  let component: RemoteloginApprovalsComponent;
  let fixture: ComponentFixture<RemoteloginApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteloginApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteloginApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
