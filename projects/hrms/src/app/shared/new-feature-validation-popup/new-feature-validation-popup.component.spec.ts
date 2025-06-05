import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFeatureValidationPopupComponent } from './new-feature-validation-popup.component';

describe('NewFeatureValidationPopupComponent', () => {
  let component: NewFeatureValidationPopupComponent;
  let fixture: ComponentFixture<NewFeatureValidationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFeatureValidationPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFeatureValidationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
