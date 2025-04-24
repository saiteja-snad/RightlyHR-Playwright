import { Component } from '@angular/core';
// Validator to check for whitespace
export function noWhitespaceValidator(control: any) {
  if (control.value && control.value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}

@Component({
  selector: 'app-nowhitespace',
  imports: [],
  templateUrl: './nowhitespace.component.html',
  styleUrl: './nowhitespace.component.scss'
})
export class NowhitespaceComponent {

}
