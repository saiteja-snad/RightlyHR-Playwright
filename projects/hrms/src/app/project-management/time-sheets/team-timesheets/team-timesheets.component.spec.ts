import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTimesheetsComponent } from './team-timesheets.component';

describe('TeamTimesheetsComponent', () => {
  let component: TeamTimesheetsComponent;
  let fixture: ComponentFixture<TeamTimesheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamTimesheetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamTimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
