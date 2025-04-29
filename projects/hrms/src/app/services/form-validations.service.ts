import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationsService {

  constructor() { }

  restrictAlphabets(event: KeyboardEvent) {
    const key = event.key;
    
    if (
      key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight' ||
      key === 'Tab'
    ) {
      return;
    }

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

  restrictInitialSpace(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    
    // Prevent the first character from being a space
    if (event.key === ' ' && inputElement.selectionStart === 0) {
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

    const isAlphabetic = /^[A-Za-z0-9\s]$/.test(key);
    if (!isAlphabetic) {
      event.preventDefault();
    }
  }

  restrictInputAllowSpecialChars(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
  
    // Allow navigation and control keys
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' ||
      key === 'ArrowRight' || key === 'Tab'
    ) {
      return;
    }
  
    const cursorPosition = inputElement.selectionStart || 0;
    
    // Prevent the first character from being a space
    if ((key === ' ' || /^[0-9]$/.test(key)) && cursorPosition === 0) {
      event.preventDefault();
      return;
    }
  
    // Regex allows letters, numbers, space, and common special characters
    const isAllowed = /^[A-Za-z0-9\s.-]$/.test(key);
    if (!isAllowed) {
      event.preventDefault();
    }
  }

  maxCharactersValidator(max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value.length >= max) {
        return { maxCharacters: true };
      }
      return null;
    };
  }

  restrictInputAllowDot(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
  
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }
  
    // Prevent the first character from being a space or dot
    if ((key === ' ' || key === '.') && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }
  
    const isAllowed = /^[A-Za-z0-9.\s]$/.test(key);
    if (!isAllowed) {
      event.preventDefault();
    }
  }

  
  
  blockNonAlphabets(event: KeyboardEvent): void {
    const key = event.key;
    const input = (event.target as HTMLInputElement).value;
 
    if (
      key === 'Backspace' || key === 'Delete' ||  key === 'Tab' ||
      key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'Home' || key === 'End'
    ) {
      return;
    }

    const pattern =  /^[a-zA-Z. ]$/;
    if (!pattern.test(key) || (key === ' ' && input.length === 0)) {
      event.preventDefault();
    }
  }

  restrictSpecialCharacters(event: KeyboardEvent) {
    const key = event.key;
    const regex = /^[a-zA-Z0-9 ]*$/;
    if (!regex.test(key)) {
      event.preventDefault();  
    }
  }


  validateInput(control: AbstractControl | null) {
    if (!control) return; // Ensure control exists
    let value = control.value || ''; // Ensure value is a string

    // Remove leading spaces
    value = value.replace(/^\s+/, '');

    // Prevent starting with special characters
    if (/^[^a-zA-Z0-9]/.test(value)) {
      value = value.replace(/^[^a-zA-Z0-9]+/, '');
    }

    control.setValue(value, { emitEvent: false });
  }


}
