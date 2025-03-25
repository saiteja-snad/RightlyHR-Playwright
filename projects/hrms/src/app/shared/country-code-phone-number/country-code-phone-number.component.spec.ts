import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryCodePhoneNumberComponent } from './country-code-phone-number.component';

describe('CountryCodePhoneNumberComponent', () => {
  let component: CountryCodePhoneNumberComponent;
  let fixture: ComponentFixture<CountryCodePhoneNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryCodePhoneNumberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryCodePhoneNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
