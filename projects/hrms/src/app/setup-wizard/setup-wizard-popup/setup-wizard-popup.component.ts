import { Component, inject, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SetupWizardService } from '../services/setup-wizard.service';

@Component({
  selector: 'app-setup-wizard-popup',
  imports: [CommonModule],
  templateUrl: './setup-wizard-popup.component.html',
  styleUrl: './setup-wizard-popup.component.scss'
})
export class SetupWizardPopupComponent implements OnInit {
  readonly wizardService = inject(SetupWizardService);
  private readonly router = inject(Router);
  readonly close = output<void>();

  ngOnInit(): void {
    this.wizardService.loadProgress().subscribe();
  }

  onClose(): void {
    this.close.emit();
  }

  onResumeSetup(): void {
    const module = this.wizardService.currentModule();

    this.close.emit();
    this.router.navigate(['/setup-wizard', module.route]);
  }

  isCurrentStep(index: number): boolean {
    return index === this.wizardService.currentModuleIndex() && !this.wizardService.modules()[index]?.completed;
  }
}
