import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularizationForYouRequestComponent } from './regularization-for-you-request.component';

describe('RegularizationForYouRequestComponent', () => {
  let component: RegularizationForYouRequestComponent;
  let fixture: ComponentFixture<RegularizationForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegularizationForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegularizationForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
