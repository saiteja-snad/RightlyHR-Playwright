import { Injectable } from '@angular/core';

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
