import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsUpdateIconComponent } from './settings-update-icon.component';

describe('SettingsUpdateIconComponent', () => {
  let component: SettingsUpdateIconComponent;
  let fixture: ComponentFixture<SettingsUpdateIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsUpdateIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsUpdateIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
