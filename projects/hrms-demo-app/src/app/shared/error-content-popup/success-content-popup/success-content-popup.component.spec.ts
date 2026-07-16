import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessContentPopupComponent } from './success-content-popup.component';

describe('SuccessContentPopupComponent', () => {
  let component: SuccessContentPopupComponent;
  let fixture: ComponentFixture<SuccessContentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessContentPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessContentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
