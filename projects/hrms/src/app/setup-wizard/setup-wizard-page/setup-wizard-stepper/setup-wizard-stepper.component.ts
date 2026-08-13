import { Component, inject } from '@angular/core';
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

  getStepState(index: number): 'completed' | 'active' | 'inactive' {
    const modules = this.wizardService.modules();
    if (modules[index]?.completed) return 'completed';
    if (index === this.wizardService.currentModuleIndex()) return 'active';
    return 'inactive';
  }
}
