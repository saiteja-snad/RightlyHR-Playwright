import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAssetsConfigurationsTabsComponent } from './settings-assets-configurations-tabs.component';

describe('SettingsAssetsConfigurationsTabsComponent', () => {
  let component: SettingsAssetsConfigurationsTabsComponent;
  let fixture: ComponentFixture<SettingsAssetsConfigurationsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAssetsConfigurationsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsAssetsConfigurationsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
