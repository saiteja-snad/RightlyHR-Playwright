import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetupWizardService } from '../../services/setup-wizard.service';

@Component({
  selector: 'app-setup-wizard-stepper',
  imports: [CommonModule],
  templateUrl: './setup-wizard-stepper.component.html',
  styleUrl: './setup-wizard-stepper.component.scss'
})
export class SetupWizardStepperComponent {
  readonly wizardService = inject(SetupWizardService);
  readonly activeIndex = input.required<number>();

  getStepState(index: number): 'completed' | 'active' | 'inactive' {
    if (this.wizardService.modules()[index]?.completed) return 'completed';
    if (index === this.activeIndex()) return 'active';
    return 'inactive';
  }

  getCompletedLineWidth(): string {
    const total = this.wizardService.modules().length;
    if (total <= 1) return '0%';
    const completedSegments = this.activeIndex();
    const pct = Math.min((completedSegments / (total - 1)) * 100, 100);
    return `${pct}%`;
  }
}
