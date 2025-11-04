import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsLockingSystemTabsComponent } from './settings-locking-system-tabs.component';

describe('SettingsLockingSystemTabsComponent', () => {
  let component: SettingsLockingSystemTabsComponent;
  let fixture: ComponentFixture<SettingsLockingSystemTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsLockingSystemTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsLockingSystemTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
