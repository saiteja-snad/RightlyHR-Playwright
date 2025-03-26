import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTextCaptalize]'
})

export class TextCaptalizeDirective {
  constructor(private ref: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const inputString = event.target.value;
    let outputString = '';
    let capitalizeNextChar = true;
    for (let i = 0; i < inputString.length; i++) {
      const currentChar = inputString.charAt(i);
      if (currentChar === ' ') {
        capitalizeNextChar = true;
        outputString += currentChar;
      } else if (capitalizeNextChar) {
        outputString += currentChar.toUpperCase();
        capitalizeNextChar = false;
      } else {
        outputString += currentChar;
      }
    }
    this.ref.nativeElement.value = outputString;
  }
}