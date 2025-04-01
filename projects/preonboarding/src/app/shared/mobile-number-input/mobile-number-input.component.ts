import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import intlTelInput from 'intl-tel-input';
import { FormValidationService } from '../../common-services/form-validation.service';
@Component({
  selector: 'app-mobile-number-input',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mobile-number-input.component.html',
  styleUrl: './mobile-number-input.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class MobileNumberInputComponent {
  @Input() formControl!: FormControl;
  @Input() countryCode!: string;
  iti: any;
  apiData: any = null;
  countryName: string = '';
  @Output() phoneDataChange = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private formsValidation: FormValidationService) {}

  ngOnInit(): void {
    const inputElement = document.getElementById('phone') as HTMLInputElement;
    inputElement.addEventListener('input', () => {
      this.updatePhoneData(inputElement);
    });
    // Listen for changes in the selected country
    inputElement.addEventListener('countrychange', () => {
      this.updatePhoneData(inputElement);
    });
  }

  ngOnChanges() {
    const inputElement = document.getElementById('phone') as HTMLInputElement;
    // Formats the number
    if (inputElement && this.countryCode) {
      this.iti = intlTelInput(inputElement, {
        initialCountry: 'us',
        separateDialCode: true,
      });
      console.log(this.iti);
    }
    console.log(this.countryCode);
    this.iti?.setCountry(this.countryCode?.toLowerCase());
  }

  updatePhoneData(inputElement: HTMLInputElement): void {
    if (this.iti) {
      const selectedCountryData = this.iti.getSelectedCountryData();
      const minLength = this.formsValidation.getMinPhoneLength(selectedCountryData.iso2.toUpperCase());
      // console.log(selectedCountryData);
      const phoneData = {
        number: inputElement.value,
        internationalNumber: `+${selectedCountryData.dialCode} ${inputElement.value}`,
        countryName: selectedCountryData.name,
        countryCode: selectedCountryData.iso2.toUpperCase(),
        dialCode: `+${selectedCountryData.dialCode}`, // Dial code with '+'
      };
      this.formControl.setValue(phoneData.number);

      inputElement.value = phoneData.number;
      if (inputElement.value.length < minLength) {
        this.formControl.setErrors({ minLength: true });
      } else {
        this.formControl.setErrors(null);
      }
      this.phoneDataChange.emit(phoneData);
    }
  }

  onPhoneNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
  
    if (this.iti) {
      const countryCode = this.iti.getSelectedCountryData().iso2.toUpperCase();
      const minLength = this.formsValidation.getMinPhoneLength(countryCode);
  
      // Restrict input length based on country-specific minimum length
      if (value.length > minLength) {
        value = value.slice(0, minLength);
      }
  
      // Dynamically update the input field's maxLength to ensure it's consistent with validation
      input.maxLength = minLength;
  
      // Set value and trigger form control update
      input.value = value;
      this.formControl?.setValue(value, { emitEvent: false });
  
      // Optionally, mark the form control as dirty to trigger validation
      if (this.formControl && this.formControl.value.length < minLength) {
        this.formControl.setErrors({ minlength: true });
      }
    }
  }
  

  ngOnDestroy(): void {
    // Destroy the intlTelInput instance if it exists
    if (this.iti) {
      this.iti.destroy(); // Clean up intlTelInput resources
      this.iti = null;
    }
    // Clear input values
    this.formControl = undefined as any; // or set to null, based on your application preference
    this.countryCode = undefined as any;
  }
}
