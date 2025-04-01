import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileNumberInputComponent } from './mobile-number-input.component';

describe('MobileNumberInputComponent', () => {
  let component: MobileNumberInputComponent;
  let fixture: ComponentFixture<MobileNumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileNumberInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileNumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
