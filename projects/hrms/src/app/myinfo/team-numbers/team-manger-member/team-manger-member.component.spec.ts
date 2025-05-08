import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMangerMemberComponent } from './team-manger-member.component';

describe('TeamMangerMemberComponent', () => {
  let component: TeamMangerMemberComponent;
  let fixture: ComponentFixture<TeamMangerMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMangerMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMangerMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
