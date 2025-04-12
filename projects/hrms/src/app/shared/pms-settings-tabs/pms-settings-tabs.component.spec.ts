import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsSettingsTabsComponent } from './pms-settings-tabs.component';

describe('PmsSettingsTabsComponent', () => {
  let component: PmsSettingsTabsComponent;
  let fixture: ComponentFixture<PmsSettingsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmsSettingsTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmsSettingsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
