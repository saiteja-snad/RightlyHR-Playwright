import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingInfoComponent } from './onboarding-info.component';

describe('OnboardingInfoComponent', () => {
  let component: OnboardingInfoComponent;
  let fixture: ComponentFixture<OnboardingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
