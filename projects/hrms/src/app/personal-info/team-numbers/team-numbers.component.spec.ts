import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamNumbersComponent } from './team-numbers.component';

describe('TeamNumbersComponent', () => {
  let component: TeamNumbersComponent;
  let fixture: ComponentFixture<TeamNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamNumbersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
