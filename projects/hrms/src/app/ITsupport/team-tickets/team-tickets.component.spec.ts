import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTicketsComponent } from './team-tickets.component';

describe('TeamTicketsComponent', () => {
  let component: TeamTicketsComponent;
  let fixture: ComponentFixture<TeamTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
