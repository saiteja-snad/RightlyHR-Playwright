import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceLockPanelConfigurationComponent } from './attendance-lock-panel-configuration.component';

describe('AttendanceLockPanelConfigurationComponent', () => {
  let component: AttendanceLockPanelConfigurationComponent;
  let fixture: ComponentFixture<AttendanceLockPanelConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceLockPanelConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceLockPanelConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
