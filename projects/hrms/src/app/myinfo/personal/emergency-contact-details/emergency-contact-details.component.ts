import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss'
})
export class EmergencyContactDetailsComponent {
  buttons= false;
  buttons2= false;
  showButtons() {
    this.buttons = !this.buttons
  }

  showButtons2() {
    this.buttons2 = !this.buttons2
  }
}
