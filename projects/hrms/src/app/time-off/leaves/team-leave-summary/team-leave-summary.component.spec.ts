import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLeaveSummaryComponent } from './team-leave-summary.component';

describe('TeamLeaveSummaryComponent', () => {
  let component: TeamLeaveSummaryComponent;
  let fixture: ComponentFixture<TeamLeaveSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLeaveSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLeaveSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
