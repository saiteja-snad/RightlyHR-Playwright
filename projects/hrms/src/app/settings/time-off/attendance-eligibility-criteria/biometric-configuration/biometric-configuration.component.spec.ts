import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometricConfigurationComponent } from './biometric-configuration.component';

describe('BiometricConfigurationComponent', () => {
  let component: BiometricConfigurationComponent;
  let fixture: ComponentFixture<BiometricConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiometricConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BiometricConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
