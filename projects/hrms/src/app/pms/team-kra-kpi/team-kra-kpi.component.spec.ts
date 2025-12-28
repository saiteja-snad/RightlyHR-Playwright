import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamKraKpiComponent } from './team-kra-kpi.component';

describe('TeamKraKpiComponent', () => {
  let component: TeamKraKpiComponent;
  let fixture: ComponentFixture<TeamKraKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamKraKpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamKraKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
