import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPerformanceReviewComponent } from './team-performance-review.component';

describe('TeamPerformanceReviewComponent', () => {
  let component: TeamPerformanceReviewComponent;
  let fixture: ComponentFixture<TeamPerformanceReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPerformanceReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamPerformanceReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
