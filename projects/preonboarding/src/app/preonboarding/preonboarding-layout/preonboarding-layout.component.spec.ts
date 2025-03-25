import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreonboardingLayoutComponent } from './preonboarding-layout.component';

describe('PreonboardingLayoutComponent', () => {
  let component: PreonboardingLayoutComponent;
  let fixture: ComponentFixture<PreonboardingLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreonboardingLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreonboardingLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
