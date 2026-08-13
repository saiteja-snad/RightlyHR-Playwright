import { Component, inject, OnInit } from '@angular/core';
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
export class SetupWizardPageComponent implements OnInit {
  readonly wizardService = inject(SetupWizardService);
  private readonly router = inject(Router);

  get isCompletePage(): boolean {
    return this.router.url.includes('/complete');
  }

  ngOnInit(): void {
    this.wizardService.loadProgress().subscribe(progress => {
      if (!progress || this.isCompletePage) {
        return;
      }

      if (progress.isCompleted) {
        this.router.navigate(['/setup-wizard/complete']);
        return;
      }

      const urlTab = this.router.url.split('/').pop()?.split('?')[0];
      if (!urlTab || urlTab === 'setup-wizard' || urlTab === 'complete') {
        this.router.navigate(['/setup-wizard', progress.currentTab]);
      }
    });
  }

  onBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
