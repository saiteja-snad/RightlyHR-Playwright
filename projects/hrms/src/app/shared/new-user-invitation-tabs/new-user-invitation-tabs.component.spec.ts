import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserInvitationTabsComponent } from './new-user-invitation-tabs.component';

describe('NewUserInvitationTabsComponent', () => {
  let component: NewUserInvitationTabsComponent;
  let fixture: ComponentFixture<NewUserInvitationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewUserInvitationTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewUserInvitationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
