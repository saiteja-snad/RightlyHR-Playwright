import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsStatusTabsComponent } from './settings-status-tabs.component';

describe('SettingsStatusTabsComponent', () => {
  let component: SettingsStatusTabsComponent;
  let fixture: ComponentFixture<SettingsStatusTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsStatusTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsStatusTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
