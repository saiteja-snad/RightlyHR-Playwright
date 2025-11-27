import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingApprovalTabsComponent } from './onboarding-approval-tabs.component';

describe('OnboardingApprovalTabsComponent', () => {
  let component: OnboardingApprovalTabsComponent;
  let fixture: ComponentFixture<OnboardingApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
