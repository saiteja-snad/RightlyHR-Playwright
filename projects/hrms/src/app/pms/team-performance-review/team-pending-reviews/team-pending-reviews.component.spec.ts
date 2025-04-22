import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPendingReviewsComponent } from './team-pending-reviews.component';

describe('TeamPendingReviewsComponent', () => {
  let component: TeamPendingReviewsComponent;
  let fixture: ComponentFixture<TeamPendingReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPendingReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamPendingReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
