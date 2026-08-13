import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SetupWizardFormModalService } from './setup-wizard-form-modal.service';

export const SETUP_WIZARD_QUERY_PARAM = 'fromSetupWizard';

@Injectable({ providedIn: 'root' })
export class SetupWizardNavigationService {
  private readonly router = inject(Router);
  private readonly formModal = inject(SetupWizardFormModalService);
  private activeStep: string | null = null;

  setActiveStep(step: string | null): void {
    this.activeStep = step;
  }

  getActiveStep(): string | null {
    return this.activeStep;
  }

  isInsideWizardRoute(): boolean {
    return this.router.url.includes('/setup-wizard');
  }

  isModalContext(): boolean {
    return this.formModal.isModalContext();
  }

  getWizardStepFromUrl(url = this.router.url): string | null {
    const match = url.match(/\/setup-wizard\/([^/?#]+)/);
    return match?.[1] ?? null;
  }

  getReturnStep(route?: ActivatedRoute): string | null {
    let current: ActivatedRoute | null = route ?? null;

    while (current) {
      const step = current.snapshot.queryParamMap.get(SETUP_WIZARD_QUERY_PARAM);
      if (step) {
        return step;
      }
      current = current.parent;
    }

    return this.activeStep;
  }

  isFromSetupWizard(route?: ActivatedRoute): boolean {
    const step = this.getReturnStep(route);
    return !!step && step !== 'complete';
  }

  getParentBreadcrumb(defaultLabel: string, route?: ActivatedRoute): string {
    if (this.formModal.isModalContext()) {
      return 'Setup Wizard';
    }
    return this.isFromSetupWizard(route) ? 'Setup Wizard' : defaultLabel;
  }

  closeWizardFormOrNavigateBack(defaultPath: string | string[], route?: ActivatedRoute): void {
    if (this.formModal.dismissActive('cancel')) {
      return;
    }
    this.navigateBack(defaultPath, route);
  }

  completeWizardFormOrNavigateBack(defaultPath: string | string[], route?: ActivatedRoute): void {
    if (this.formModal.closeActive('saved')) {
      return;
    }
    this.navigateBack(defaultPath, route);
  }

  navigateToSettings(path: string | string[], queryParams?: Record<string, unknown>): void {
    const commands = Array.isArray(path) ? path : [path];
    const step = this.getWizardStepFromUrl() ?? this.activeStep;

    if (step && step !== 'complete') {
      this.router.navigate(commands, {
        queryParams: {
          ...queryParams,
          [SETUP_WIZARD_QUERY_PARAM]: step
        }
      });
      return;
    }

    this.router.navigate(commands, queryParams ? { queryParams } : undefined);
  }

  navigateBack(defaultPath: string | string[], route?: ActivatedRoute): void {
    const step = this.getReturnStep(route);

    if (step && step !== 'complete') {
      this.router.navigate(['/setup-wizard', step]);
      return;
    }

    this.router.navigate(Array.isArray(defaultPath) ? defaultPath : [defaultPath]);
  }
}
