import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformaceReviewTabsComponent } from './performace-review-tabs.component';

describe('PerformaceReviewTabsComponent', () => {
  let component: PerformaceReviewTabsComponent;
  let fixture: ComponentFixture<PerformaceReviewTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformaceReviewTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformaceReviewTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
