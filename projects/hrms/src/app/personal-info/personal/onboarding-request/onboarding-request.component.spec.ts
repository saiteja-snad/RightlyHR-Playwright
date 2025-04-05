import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingRequestComponent } from './onboarding-request.component';

describe('OnboardingRequestComponent', () => {
  let component: OnboardingRequestComponent;
  let fixture: ComponentFixture<OnboardingRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
