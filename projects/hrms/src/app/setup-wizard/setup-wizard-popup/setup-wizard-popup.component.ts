import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SetupWizardService } from '../services/setup-wizard.service';

@Component({
  selector: 'app-setup-wizard-popup',
  imports: [CommonModule],
  templateUrl: './setup-wizard-popup.component.html',
  styleUrl: './setup-wizard-popup.component.scss'
})
export class SetupWizardPopupComponent {
  readonly wizardService = inject(SetupWizardService);
  private readonly router = inject(Router);
  readonly close = output<void>();

  onClose(): void {
    this.close.emit();
  }

  onResumeSetup(): void {
    const module = this.wizardService.firstIncompleteModule();
    this.wizardService.setCurrentModule(
      this.wizardService.modules().findIndex(m => m.id === module.id)
    );
    this.close.emit();
    this.router.navigate(['/setup-wizard', module.route]);
  }

  onChecklistItemClick(index: number): void {
    const module = this.wizardService.modules()[index];
    if (!module.completed) {
      this.wizardService.setCurrentModule(index);
      this.close.emit();
      this.router.navigate(['/setup-wizard', module.route]);
    }
  }
}
