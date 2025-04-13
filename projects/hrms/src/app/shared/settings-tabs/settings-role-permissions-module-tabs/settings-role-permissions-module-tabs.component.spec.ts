import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsRolePermissionsModuleTabsComponent } from './settings-role-permissions-module-tabs.component';

describe('SettingsRolePermissionsModuleTabsComponent', () => {
  let component: SettingsRolePermissionsModuleTabsComponent;
  let fixture: ComponentFixture<SettingsRolePermissionsModuleTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsRolePermissionsModuleTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsRolePermissionsModuleTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
