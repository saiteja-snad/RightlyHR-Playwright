import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupWizardService } from '../services/setup-wizard.service';

@Component({
  selector: 'app-setup-wizard-button',
  imports: [CommonModule],
  templateUrl: './setup-wizard-button.component.html',
  styleUrl: './setup-wizard-button.component.scss'
})
export class SetupWizardButtonComponent {
  readonly wizardService = inject(SetupWizardService);
  readonly clicked = output<void>();

  onClick(): void {
    this.clicked.emit();
  }
}
