import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMainHeaderTabsComponent } from './settings-main-header-tabs.component';

describe('SettingsMainHeaderTabsComponent', () => {
  let component: SettingsMainHeaderTabsComponent;
  let fixture: ComponentFixture<SettingsMainHeaderTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsMainHeaderTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsMainHeaderTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
