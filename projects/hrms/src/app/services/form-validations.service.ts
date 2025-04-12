import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationsService {

  constructor() { }

  restrictAlphabets(event: KeyboardEvent) {
    const key = event.key;
    if (!/[0-9]/.test(key)) {
      event.preventDefault();  
    }
  }

  futureDateValidator(control: any): { [key: string]: boolean } | null {
    const currentDate = new Date();
    if (control.value && new Date(control.value) > currentDate) {
      return { futureDate: true };
    }
    return null;
  }
//zero
  noAlphabetsOrZeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) return null; // Allow empty values (handled by 'required' validator)
      
      if (/[a-zA-Z]/.test(value)) {
        return { noAlphabets: true }; // Rejects alphabets
      }
  
      if (parseFloat(value) === 0) {
        return { nonZero: true }; // Rejects zero
      }
  
      return null; // Valid input
    };
  }
  restrictInitialSpace(event: any) {
    const value = event.target.value;
    if (value.length === 0 && event.key === ' ') {
      event.preventDefault(); // Block space at the start
    }
  }

  restrictSpecialCharacters(event: KeyboardEvent) {
    const key = event.key;
    const regex = /^[a-zA-Z0-9 ]*$/; // Allow only alphanumeric characters and spaces
    if (!regex.test(key)) {
      event.preventDefault();  
    }
  }

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
  }
}
