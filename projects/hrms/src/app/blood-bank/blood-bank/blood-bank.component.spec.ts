import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodBankComponent } from './blood-bank.component';

describe('BloodBankComponent', () => {
  let component: BloodBankComponent;
  let fixture: ComponentFixture<BloodBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodBankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
