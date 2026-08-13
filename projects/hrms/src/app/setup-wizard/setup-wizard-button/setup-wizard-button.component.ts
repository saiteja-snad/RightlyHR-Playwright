import { Component, inject, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, take } from 'rxjs';
import { SetupWizardService } from '../services/setup-wizard.service';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-setup-wizard-button',
  imports: [CommonModule],
  templateUrl: './setup-wizard-button.component.html',
  styleUrl: './setup-wizard-button.component.scss'
})
export class SetupWizardButtonComponent implements OnInit {
  readonly wizardService = inject(SetupWizardService);
  readonly tenantService = inject(TenantService);
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

  readonly showSetupWizard = toSignal(
    this.tenantService.verificationResponse$.pipe(
      map(() => this.tenantService.shouldShowSetupWizard)
    ),
    { initialValue: this.tenantService.shouldShowSetupWizard }
  );

  ngOnInit(): void {
    if (this.tenantService.shouldShowSetupWizard) {
      this.wizardService.loadProgress().subscribe();
      return;
    }

    this.tenantService.verificationResponse$.pipe(
      filter(() => this.tenantService.shouldShowSetupWizard),
      take(1)
    ).subscribe(() => {
      this.wizardService.loadProgress().subscribe();
    });
  }

  onClick(): void {
    this.clicked.emit();
  }
}
