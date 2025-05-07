import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMembersTabsComponent } from './team-members-tabs.component';

describe('TeamMembersTabsComponent', () => {
  let component: TeamMembersTabsComponent;
  let fixture: ComponentFixture<TeamMembersTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMembersTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMembersTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
