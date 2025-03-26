import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorContentPopupComponent } from './error-content-popup.component';

describe('ErrorContentPopupComponent', () => {
  let component: ErrorContentPopupComponent;
  let fixture: ComponentFixture<ErrorContentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorContentPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorContentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
