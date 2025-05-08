import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMemberTabsComponent } from './team-member-tabs.component';

describe('TeamMemberTabsComponent', () => {
  let component: TeamMemberTabsComponent;
  let fixture: ComponentFixture<TeamMemberTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMemberTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMemberTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
