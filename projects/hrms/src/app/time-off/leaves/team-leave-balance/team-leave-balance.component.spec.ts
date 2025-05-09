import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLeaveBalanceComponent } from './team-leave-balance.component';

describe('TeamLeaveBalanceComponent', () => {
  let component: TeamLeaveBalanceComponent;
  let fixture: ComponentFixture<TeamLeaveBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLeaveBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
