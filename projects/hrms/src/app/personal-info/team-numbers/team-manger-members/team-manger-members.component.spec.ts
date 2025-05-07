import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMangerMembersComponent } from './team-manger-members.component';

describe('TeamMangerMembersComponent', () => {
  let component: TeamMangerMembersComponent;
  let fixture: ComponentFixture<TeamMangerMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMangerMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMangerMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
