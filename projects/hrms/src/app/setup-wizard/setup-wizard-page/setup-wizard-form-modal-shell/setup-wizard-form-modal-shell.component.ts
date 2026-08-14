import { Component, Type, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-setup-wizard-form-modal-shell',
  imports: [CommonModule],
  templateUrl: './setup-wizard-form-modal-shell.component.html',
  styleUrl: './setup-wizard-form-modal-shell.component.scss'
})
export class SetupWizardFormModalShellComponent {
  private readonly activeModal = inject(NgbActiveModal);

  title = '';
  formComponent!: Type<unknown>;

  onClose(): void {
    this.activeModal.dismiss('cancel');
  }
}
