import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreOnboardingInfoComponent } from './pre-onboarding-info.component';

describe('PreOnboardingInfoComponent', () => {
  let component: PreOnboardingInfoComponent;
  let fixture: ComponentFixture<PreOnboardingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreOnboardingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreOnboardingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
