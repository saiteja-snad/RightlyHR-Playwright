import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SetupWizardService } from '../services/setup-wizard.service';
import { SetupWizardStepperComponent } from './setup-wizard-stepper/setup-wizard-stepper.component';
import { clearLegacySetupWizardProgress } from '../utils/setup-wizard-storage.util';

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
    clearLegacySetupWizardProgress();
    this.wizardService.loadProgress().subscribe(progress => {
      if (!progress || this.isCompletePage) {
        return;
      }

      if (progress.isCompleted) {
        this.router.navigate(['/setup-wizard/complete']);
        return;
      }

      const urlTab = this.getWizardRouteFromUrl(this.router.url);
      if (!urlTab || urlTab === 'setup-wizard' || urlTab === 'complete') {
        this.router.navigate(['/setup-wizard', progress.currentTab]);
        return;
      }

      const urlIndex = this.wizardService.getModuleIndexByRoute(urlTab);
      if (urlIndex >= 0) {
        this.wizardService.syncCurrentTab(urlIndex);
      }
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      const urlTab = this.getWizardRouteFromUrl(event.urlAfterRedirects);
      if (!urlTab || urlTab === 'complete') {
        return;
      }

      const index = this.wizardService.getModuleIndexByRoute(urlTab);
      if (index >= 0) {
        this.wizardService.syncCurrentTab(index);
      }
    });
  }

  private getWizardRouteFromUrl(url: string): string | null {
    const match = url.match(/\/setup-wizard\/([^/?#]+)/);
    return match?.[1] ?? null;
  }

  onBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
