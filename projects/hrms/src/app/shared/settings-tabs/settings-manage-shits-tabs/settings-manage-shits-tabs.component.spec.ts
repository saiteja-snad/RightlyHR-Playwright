import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsManageShitsTabsComponent } from './settings-manage-shits-tabs.component';

describe('SettingsManageShitsTabsComponent', () => {
  let component: SettingsManageShitsTabsComponent;
  let fixture: ComponentFixture<SettingsManageShitsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsManageShitsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsManageShitsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
