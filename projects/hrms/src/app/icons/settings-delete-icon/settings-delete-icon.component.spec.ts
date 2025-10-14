import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDeleteIconComponent } from './settings-delete-icon.component';

describe('SettingsDeleteIconComponent', () => {
  let component: SettingsDeleteIconComponent;
  let fixture: ComponentFixture<SettingsDeleteIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsDeleteIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDeleteIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
