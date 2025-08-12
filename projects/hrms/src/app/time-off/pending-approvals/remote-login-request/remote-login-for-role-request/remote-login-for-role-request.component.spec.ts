import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLoginForRoleRequestComponent } from './remote-login-for-role-request.component';

describe('RemoteLoginForRoleRequestComponent', () => {
  let component: RemoteLoginForRoleRequestComponent;
  let fixture: ComponentFixture<RemoteLoginForRoleRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteLoginForRoleRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLoginForRoleRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
