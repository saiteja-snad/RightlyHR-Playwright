import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsPersonalTabsComponent } from './settings-personal-tabs.component';

describe('SettingsPersonalTabsComponent', () => {
  let component: SettingsPersonalTabsComponent;
  let fixture: ComponentFixture<SettingsPersonalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPersonalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsPersonalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
