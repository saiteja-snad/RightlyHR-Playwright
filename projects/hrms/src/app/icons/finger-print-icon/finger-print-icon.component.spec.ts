import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerPrintIconComponent } from './finger-print-icon.component';

describe('FingerPrintIconComponent', () => {
  let component: FingerPrintIconComponent;
  let fixture: ComponentFixture<FingerPrintIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FingerPrintIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FingerPrintIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
