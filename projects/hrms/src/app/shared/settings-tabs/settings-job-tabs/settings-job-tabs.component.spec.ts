import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsJobTabsComponent } from './settings-job-tabs.component';

describe('SettingsJobTabsComponent', () => {
  let component: SettingsJobTabsComponent;
  let fixture: ComponentFixture<SettingsJobTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsJobTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsJobTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
