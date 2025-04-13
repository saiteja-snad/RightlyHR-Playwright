import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsManageHolidaysTabsComponent } from './settings-manage-holidays-tabs.component';

describe('SettingsManageHolidaysTabsComponent', () => {
  let component: SettingsManageHolidaysTabsComponent;
  let fixture: ComponentFixture<SettingsManageHolidaysTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsManageHolidaysTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsManageHolidaysTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
