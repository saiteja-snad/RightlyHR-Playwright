import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsTimeOffTabsComponent } from './settings-time-off-tabs.component';

describe('SettingsTimeOffTabsComponent', () => {
  let component: SettingsTimeOffTabsComponent;
  let fixture: ComponentFixture<SettingsTimeOffTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsTimeOffTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsTimeOffTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
