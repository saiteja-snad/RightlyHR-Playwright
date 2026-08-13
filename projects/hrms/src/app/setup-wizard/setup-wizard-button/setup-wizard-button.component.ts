import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
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
  private readonly router = inject(Router);

  readonly visible = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => !this.router.url.includes('/setup-wizard')),
      startWith(!this.router.url.includes('/setup-wizard'))
    ),
    { initialValue: !this.router.url.includes('/setup-wizard') }
  );

  onClick(): void {
    this.clicked.emit();
  }
}
