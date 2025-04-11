import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPerformanceReviewComponent } from './my-performance-review.component';

describe('MyPerformanceReviewComponent', () => {
  let component: MyPerformanceReviewComponent;
  let fixture: ComponentFixture<MyPerformanceReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPerformanceReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPerformanceReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
