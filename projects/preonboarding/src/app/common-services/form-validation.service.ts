import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})

export class FormValidationService {
  constructor() { }
  
  blockLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    // If space is pressed and cursor is at the start (position 0), block it
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  //copyandpaste
  validatePaste(event: ClipboardEvent): void {
    const pastedData = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pastedData)) {
      event.preventDefault(); // Cancel the paste event if the data is not numeric
    }
  }

  ///onlynumnbers
  restrictAlphabets(event: KeyboardEvent) {
    const key = event.key;
    if (!/[0-9]/.test(key)) {
      event.preventDefault();
    }
  }

  //aplicatives(abc)
  restrictInput(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    const isAlphabetic = /^[A-Za-z\s]$/.test(key);
    if (!isAlphabetic) {
      event.preventDefault();
    }
  }

  restrictInputallowspicalcharters(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    // Allow alphabetic characters, numbers, and special characters
    const isValidCharacter = /^[A-Za-z\s!@#$%^&*(),.?":{}|<>-]$/.test(key);
    if (!isValidCharacter) {
      event.preventDefault();
    }
  }

  restrictInputallowspicalcharterswithnumbers(event: KeyboardEvent): void {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
  
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
  
    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
  
    // Allow alphabetic characters, numbers, and special characters
    const isValidCharacter = /^[A-Za-z0-9\s!@#$%^&*(),.?":{}|<>-]$/.test(key);
    if (!isValidCharacter) {
      event.preventDefault();
    }
  }

  restrictInputAllowsAlphaNumericAndHyphen(event: KeyboardEvent): void {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
  
    // Allow control/navigation keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(key)) {
      return;
    }
  
    // Prevent first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
  
    // Allow only alphanumeric characters and hyphen
    const isValidCharacter = /^[A-Za-z0-9-]$/.test(key);
    if (!isValidCharacter) {
      event.preventDefault();
    }
  }
  

  restrictInputallowspoint(event: KeyboardEvent): void {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
    // Allow only alphabetic characters and the period (.)
    const isValidCharacter = /^[A-Za-z\s.]$/.test(key);
    if (!isValidCharacter) {
      event.preventDefault();
    }
  }
  // allowed only alphbet,number,-,/
restrictInputallowhypen(event: KeyboardEvent): void {
  const key = event.key;
  const inputElement = event.target as HTMLInputElement;

  // Always allow navigation and control keys
  if (
    key === 'Backspace' || key === 'Delete' || 
    key === 'ArrowLeft' || key === 'ArrowRight' || 
    key === 'Tab'
  ) {
    return;
  }

  // Prevent space as the first character
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
    return;
  }

  // Allow only A-Z, a-z, 0-9, hyphen (-), forward slash (/), and space
  const isValidCharacter = /^[A-Za-z0-9\-\/ ]$/.test(key);
  if (!isValidCharacter) {
    event.preventDefault();
  }
}


// restrict allowed only few specialcharacter
restrictInputAllowAlphaNumericAndCommonSpecialChars(event: KeyboardEvent): void {
  const key = event.key;
  const inputElement = event.target as HTMLInputElement;

  // Allow navigation/control keys
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (allowedKeys.includes(key)) {
    return;
  }

  // Prevent first character from being a space
  if (key === ' ' && inputElement.selectionStart === 0) {
    event.preventDefault();
    return;
  }

  // Allow alphabets, numbers, &, -, ., '
  const isValidCharacter = /^[A-Za-z0-9&\-.'\s]$/.test(key);
  if (!isValidCharacter) {
    event.preventDefault();
  }
}

  rateGreaterThanZero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value !== null && value <= 0) {
        return { rateGreaterThanZero: true };
      }
      return null;
    };
  }

  checkInputsNoLeadingSpaces(form: FormGroup, controlName: string) {
    const control = form.get(controlName);
    if (control) {
      const value = control.value || '';
      let updatedValue = value;
      // Remove leading spaces
      updatedValue = value.replace(/^\s+/, '');
      if (value !== updatedValue) {
        control.setValue(updatedValue, { emitEvent: false });
      }
    }
  }

  checkInputsNoLeadingSpacesAndNumbers(form: FormGroup, controlName: string) {
    const control = form.get(controlName);
    if (control) {
      const value = control.value || '';
      let updatedValue = value;
      // Remove leading spaces and numbers
      updatedValue = value.replace(/^\s+/, '').replace(/\d+/g, '');
      if (value !== updatedValue) {
        control.setValue(updatedValue, { emitEvent: false });
      }
    }
  }

  checkInputsAllowedSpecialCharacters(form: FormGroup, controlName: string) {
    const control = form.get(controlName);
    if (control) {
      const value = control.value || '';
      let updatedValue = value;
      // Remove leading spaces and allow only valid special characters (., /, -, _)
      updatedValue = value.replace(/^\s+/, '').replace(/[^a-zA-Z0-9.,/_-]/g, ''); // Allow alphanumeric and ., /, -, _
      if (value !== updatedValue) {
        control.setValue(updatedValue, { emitEvent: false });
      }
    }
  }

  checkInputsNoSpecialCharacters(form: FormGroup, controlName: string) {
    const control = form.get(controlName);
    if (control) {
      const value = control.value || '';
      let updatedValue = value;
      // Remove leading spaces and special characters
      updatedValue = value.replace(/^\s+/, '').replace(/[^a-zA-Z0-9]/g, '');
      if (value !== updatedValue) {
        control.setValue(updatedValue, { emitEvent: false });
      }
    }
  }

  checkNoSpaceForEmail(event: KeyboardEvent, formControl: FormGroup, formControlName: string): void {
    const input = event.target as HTMLInputElement;
    // Prevent spacebar from adding spaces
    if (event.key === ' ') {
      event.preventDefault(); // Stop the default behavior of the spacebar
      return;
    }
    // Validate and remove spaces in case of copy-paste
    const valueWithoutSpaces = input.value.replace(/\s+/g, '');
    if (input.value !== valueWithoutSpaces) {
      input.value = valueWithoutSpaces;
      formControl.get(formControlName)?.setValue(valueWithoutSpaces, { emitEvent: false });
    }
  }

  getMinPhoneLength(countryCode: string): number {
    const minLengths: { [key: string]: number } = {
      AF: 9, AL: 9, DZ: 9, AD: 6, AO: 9, AG: 7, AR: 10, AM: 8, AU: 9, AT: 10,
      AZ: 9, BH: 8, BD: 10, BB: 7, BY: 9, BE: 9, BZ: 7, BJ: 8, BT: 8, BO: 8,
      BA: 8, BW: 7, BR: 10, BN: 7, BG: 9, BF: 8, BI: 8, KH: 8, CM: 9, CA: 10,
      CV: 7, CF: 8, TD: 9, CL: 9, CN: 11, CO: 10, KM: 7, CG: 9, CR: 8, HR: 9,
      CU: 8, CY: 8, CZ: 9, DK: 8, DJ: 6, DM: 7, DO: 10, EC: 9, EG: 10, SV: 8,
      GQ: 9, ER: 7, EE: 7, ET: 9, FJ: 7, FI: 9, FR: 9, GA: 8, GM: 7, GE: 9,
      DE: 10, GH: 9, GR: 10, GD: 7, GT: 8, GN: 9, GW: 7, GY: 7, HT: 8, HN: 8,
      HK: 8, HU: 9, IS: 7, IN: 10, ID: 9, IR: 10, IQ: 10, IE: 9, IL: 9, IT: 9,
      JM: 7, JP: 10, JO: 9, KZ: 10, KE: 9, KI: 8, KP: 9, KR: 9, KW: 8, KG: 9,
      LA: 10, LV: 8, LB: 7, LS: 8, LR: 7, LY: 9, LI: 7, LT: 8, LU: 9, MG: 9,
      MW: 7, MY: 9, MV: 7, ML: 8, MT: 8, MR: 8, MU: 7, MX: 10, MD: 8, MC: 8,
      MN: 8, ME: 8, MA: 9, MZ: 9, MM: 9, NA: 7, NR: 7, NP: 10, NL: 9, NZ: 9,
      NI: 8, NE: 8, NG: 10, NO: 8, OM: 8, PK: 10, PW: 7, PA: 8, PG: 8, PY: 9,
      PE: 9, PH: 10, PL: 9, PT: 9, QA: 8, RO: 9, RU: 10, RW: 9, SA: 9, SN: 9,
      RS: 9, SC: 7, SL: 8, SG: 8, SK: 9, SI: 9, SB: 7, SO: 7, ZA: 9, ES: 9,
      LK: 9, SD: 9, SR: 7, SZ: 8, SE: 9, CH: 9, SY: 9, TW: 9, TJ: 9, TZ: 9,
      TH: 9, TG: 8, TO: 7, TT: 7, TN: 8, TR: 10, TM: 8, UG: 9, UA: 9, AE: 9,
      GB: 9, US: 10, UY: 9, UZ: 9, VU: 7, VE: 10, VN: 9, YE: 9, ZM: 9, ZW: 9
    };
    return minLengths[countryCode] || 10; // Default to 10 if not found
  }
    // replace spaces with underscores and remove special characters expect dot
  sanitizeFileName(fileName: string): string {
    let filename = fileName.replace(/\s+/g, '_');
    // Remove all special characters except dot and underscore
    filename = filename.replace(/[^\w.-]/g, '');
 
    return filename;
  }
 
}