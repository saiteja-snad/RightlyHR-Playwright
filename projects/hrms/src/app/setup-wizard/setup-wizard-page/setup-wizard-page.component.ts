import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SetupWizardService } from '../services/setup-wizard.service';
import { SetupWizardStepperComponent } from './setup-wizard-stepper/setup-wizard-stepper.component';

@Component({
  selector: 'app-setup-wizard-page',
  imports: [CommonModule, RouterOutlet, SetupWizardStepperComponent],
  templateUrl: './setup-wizard-page.component.html',
  styleUrl: './setup-wizard-page.component.scss'
})
export class SetupWizardPageComponent {
  readonly wizardService = inject(SetupWizardService);
  private readonly router = inject(Router);

  get isCompletePage(): boolean {
    return this.router.url.includes('/complete');
  }

  onBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
