import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsManagePoliciesTabsComponent } from './settings-manage-policies-tabs.component';

describe('SettingsManagePoliciesTabsComponent', () => {
  let component: SettingsManagePoliciesTabsComponent;
  let fixture: ComponentFixture<SettingsManagePoliciesTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsManagePoliciesTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsManagePoliciesTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
