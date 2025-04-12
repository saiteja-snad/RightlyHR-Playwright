import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteReviewsComponent } from './complete-reviews.component';

describe('CompleteReviewsComponent', () => {
  let component: CompleteReviewsComponent;
  let fixture: ComponentFixture<CompleteReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
