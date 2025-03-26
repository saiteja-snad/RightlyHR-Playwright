import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-offboarding-details',
  imports: [CommonModule],
  templateUrl: './offboarding-details.component.html',
  styleUrl: './offboarding-details.component.scss'
})
export class OffboardingDetailsComponent {
  buttons= false;
  showButtons() {
    this.buttons = !this.buttons
  }
}
