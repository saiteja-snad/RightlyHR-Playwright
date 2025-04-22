import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingDynamicFormsTabsComponent } from './setting-dynamic-forms-tabs.component';

describe('SettingDynamicFormsTabsComponent', () => {
  let component: SettingDynamicFormsTabsComponent;
  let fixture: ComponentFixture<SettingDynamicFormsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingDynamicFormsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingDynamicFormsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
