import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-onboarding-details',
  imports: [CommonModule],
  templateUrl: './onboarding-details.component.html',
  styleUrl: './onboarding-details.component.scss'
})
export class OnboardingDetailsComponent {
  buttons= false;
  showButtons() {
    this.buttons = !this.buttons
  }
}
