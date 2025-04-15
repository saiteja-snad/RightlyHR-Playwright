import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsExpenesConfigurtionsTabsComponent } from './settings-expenes-configurtions-tabs.component';

describe('SettingsExpenesConfigurtionsTabsComponent', () => {
  let component: SettingsExpenesConfigurtionsTabsComponent;
  let fixture: ComponentFixture<SettingsExpenesConfigurtionsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsExpenesConfigurtionsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsExpenesConfigurtionsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
