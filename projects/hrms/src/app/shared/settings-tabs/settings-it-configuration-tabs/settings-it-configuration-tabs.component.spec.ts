import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsItConfigurationTabsComponent } from './settings-it-configuration-tabs.component';

describe('SettingsItConfigurationTabsComponent', () => {
  let component: SettingsItConfigurationTabsComponent;
  let fixture: ComponentFixture<SettingsItConfigurationTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsItConfigurationTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsItConfigurationTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
