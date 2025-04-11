import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingRequestsComponent } from './onboarding-requests.component';

describe('OnboardingRequestsComponent', () => {
  let component: OnboardingRequestsComponent;
  let fixture: ComponentFixture<OnboardingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
