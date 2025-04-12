import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsEmployeeFieldsModuleTabsComponent } from './settings-employee-fields-module-tabs.component';

describe('SettingsEmployeeFieldsModuleTabsComponent', () => {
  let component: SettingsEmployeeFieldsModuleTabsComponent;
  let fixture: ComponentFixture<SettingsEmployeeFieldsModuleTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsEmployeeFieldsModuleTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsEmployeeFieldsModuleTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
