import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitateOffboardingComponent } from './initate-offboarding.component';

describe('InitateOffboardingComponent', () => {
  let component: InitateOffboardingComponent;
  let fixture: ComponentFixture<InitateOffboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitateOffboardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitateOffboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
