import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingDetailsComponent } from './onboarding-details.component';

describe('OnboardingDetailsComponent', () => {
  let component: OnboardingDetailsComponent;
  let fixture: ComponentFixture<OnboardingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
