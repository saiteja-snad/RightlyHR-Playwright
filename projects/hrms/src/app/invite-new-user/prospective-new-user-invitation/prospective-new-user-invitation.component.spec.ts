import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectiveNewUserInvitationComponent } from './prospective-new-user-invitation.component';

describe('ProspectiveNewUserInvitationComponent', () => {
  let component: ProspectiveNewUserInvitationComponent;
  let fixture: ComponentFixture<ProspectiveNewUserInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectiveNewUserInvitationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProspectiveNewUserInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
