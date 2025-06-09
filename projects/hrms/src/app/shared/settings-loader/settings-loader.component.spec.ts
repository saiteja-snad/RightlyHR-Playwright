import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsLoaderComponent } from './settings-loader.component';

describe('SettingsLoaderComponent', () => {
  let component: SettingsLoaderComponent;
  let fixture: ComponentFixture<SettingsLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
