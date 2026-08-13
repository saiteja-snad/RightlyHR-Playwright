import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SetupWizardService } from '../../services/setup-wizard.service';

@Component({
  selector: 'app-setup-complete',
  imports: [CommonModule],
  template: `
    <div class="complete-wrapper">
      <div class="complete-card">
        <div class="complete-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <h4 class="complete-title">Setup Complete!</h4>
        <p class="complete-subtitle">
          All {{ wizardService.totalCount() }} modules have been configured successfully.
          Your system is ready to use.
        </p>
        <button type="button" class="custom-btn btn-primary" (click)="onGoToDashboard()">
          Go to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .complete-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem 1rem;
    }
    .complete-card {
      text-align: center;
      background: #fff;
      border-radius: 0.75rem;
      padding: 3rem 2.5rem;
      max-width: 28rem;
      width: 100%;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      border: 1px solid #e5e7eb;
    }
    .complete-icon {
      font-size: 3.5rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    .complete-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.75rem;
    }
    .complete-subtitle {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 1.75rem;
      line-height: 1.6;
    }
  `]
})
export class SetupCompleteComponent implements OnInit {
  readonly wizardService = inject(SetupWizardService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.wizardService.markWizardCompleted();
  }

  onGoToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
