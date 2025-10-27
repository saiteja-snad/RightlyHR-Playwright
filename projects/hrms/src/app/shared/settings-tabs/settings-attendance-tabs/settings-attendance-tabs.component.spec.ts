import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAttendanceTabsComponent } from './settings-attendance-tabs.component';

describe('SettingsAttendanceTabsComponent', () => {
  let component: SettingsAttendanceTabsComponent;
  let fixture: ComponentFixture<SettingsAttendanceTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAttendanceTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsAttendanceTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
