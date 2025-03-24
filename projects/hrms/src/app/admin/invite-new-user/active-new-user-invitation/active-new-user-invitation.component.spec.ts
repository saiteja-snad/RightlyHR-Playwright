import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveNewUserInvitationComponent } from './active-new-user-invitation.component';

describe('ActiveNewUserInvitationComponent', () => {
  let component: ActiveNewUserInvitationComponent;
  let fixture: ComponentFixture<ActiveNewUserInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveNewUserInvitationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveNewUserInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
