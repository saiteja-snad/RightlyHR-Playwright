import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamCompleteReviewsComponent } from './team-complete-reviews.component';

describe('TeamCompleteReviewsComponent', () => {
  let component: TeamCompleteReviewsComponent;
  let fixture: ComponentFixture<TeamCompleteReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamCompleteReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamCompleteReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
