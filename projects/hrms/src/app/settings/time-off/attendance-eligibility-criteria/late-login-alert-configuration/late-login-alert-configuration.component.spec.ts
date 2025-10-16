import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LateLoginAlertConfigurationComponent } from './late-login-alert-configuration.component';

describe('LateLoginAlertConfigurationComponent', () => {
  let component: LateLoginAlertConfigurationComponent;
  let fixture: ComponentFixture<LateLoginAlertConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LateLoginAlertConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LateLoginAlertConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
