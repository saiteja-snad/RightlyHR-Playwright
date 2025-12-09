import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredefinedThemeSelectionComponent } from './predefined-theme-selection.component';

describe('PredefinedThemeSelectionComponent', () => {
  let component: PredefinedThemeSelectionComponent;
  let fixture: ComponentFixture<PredefinedThemeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredefinedThemeSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredefinedThemeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
