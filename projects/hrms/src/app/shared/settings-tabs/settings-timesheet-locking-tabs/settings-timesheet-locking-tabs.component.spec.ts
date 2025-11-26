import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsTimesheetLockingTabsComponent } from './settings-timesheet-locking-tabs.component';

describe('SettingsTimesheetLockingTabsComponent', () => {
  let component: SettingsTimesheetLockingTabsComponent;
  let fixture: ComponentFixture<SettingsTimesheetLockingTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsTimesheetLockingTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsTimesheetLockingTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
