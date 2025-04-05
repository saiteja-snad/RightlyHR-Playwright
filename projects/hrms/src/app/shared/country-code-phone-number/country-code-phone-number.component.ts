import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { parsePhoneNumberFromString, CountryCode, getCountries } from 'libphonenumber-js';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-country-code-phone-number',
  imports: [CommonModule, NgxCountriesDropdownModule,ReactiveFormsModule],
  templateUrl: './country-code-phone-number.component.html',
  styleUrl: './country-code-phone-number.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class CountryCodePhoneNumberComponent {
  @Input() selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  @Input() countryListConfig: any;
  @Input() placeholderPhoneNumber: string = 'Please enter mobile number';

  @Output() onPhoneChange = new EventEmitter<string>();

  phoneNumberControl = new FormControl('');
  selectedDailCode: string = '';
  selectedCountryCode: string = '';
  formattedPhoneNumber: string = '';

  ngOnInit() {
    this.phoneNumberControl.valueChanges.subscribe((value) => {
      if (value && value.trim() !== '') {
        const formattedValue = this.formatPhoneNumber(value);
        if (formattedValue) {
          this.onPhoneChange.emit(formattedValue);
        }
      }
    });
  }

  onCountryChange(country: any) {
    if (!country || !country.dialling_code || !country.code) {
      console.error('Invalid country data:', country);
      return;
    }
    // Set dial code and country code correctly
    this.selectedDailCode = country.dialling_code; // e.g., +91
    this.selectedCountryCode = country.code; // e.g., IN
    console.log('Dial Code:', this.selectedDailCode);
    console.log('Country Code:', this.selectedCountryCode);
    // Update placeholder dynamically
    this.updatePlaceholder();
    // Update validators based on country change
    this.phoneNumberControl.setValidators([this.phoneNumberValidator()]);
    this.phoneNumberControl.updateValueAndValidity();
  }
  

  formatPhoneNumber(value: string): string {
    if (!this.selectedDailCode || !value || !this.isValidCountryCode(this.selectedDailCode)) {
      return value;
    }
    try {
      const phoneNumber = parsePhoneNumberFromString(value, this.selectedDailCode as CountryCode);
      if (phoneNumber && phoneNumber.isValid()) {
        this.formattedPhoneNumber = phoneNumber.formatInternational();
        return phoneNumber.formatNational();
      }
    } catch (error) {
      console.error('Error parsing phone number:', error);
    }
  
    return value;
  }
  
  phoneNumberValidator() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!this.selectedDailCode || !value) {
        return null;
      }
      const phoneNumber = parsePhoneNumberFromString(value, this.selectedDailCode as CountryCode);
      return phoneNumber && phoneNumber.isValid() ? null : { invalidPhoneNumber: true };
    };
  }

  updatePlaceholder() {
    if (this.selectedDailCode) {
      const samplePhoneNumber = `+${this.selectedDailCode}1234567890`;
      try {
        const phoneNumber = parsePhoneNumberFromString(samplePhoneNumber, this.selectedDailCode as CountryCode);
        this.placeholderPhoneNumber = phoneNumber?.isValid() ? phoneNumber.formatNational() : '';
      } catch (error) {
        console.error('Error parsing phone number:', error);
        this.placeholderPhoneNumber = '';
      }
    }
  }

  isValidCountryCode(code: string): boolean {
    return getCountries().includes(code as CountryCode);
  }
}