import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCycleListComponent } from './review-cycle-list.component';

describe('ReviewCycleListComponent', () => {
  let component: ReviewCycleListComponent;
  let fixture: ComponentFixture<ReviewCycleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCycleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewCycleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
