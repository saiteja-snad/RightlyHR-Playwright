import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { SetupWizardService } from '../../services/setup-wizard.service';
import { SetupWizardNavigationService } from '../../services/setup-wizard-navigation.service';
import { SetupWizardStepValidationService } from '../../services/setup-wizard-step-validation.service';
import { SetupWizardAccordion, SetupWizardSectionKey } from '../../models/setup-wizard.model';
import { SetupWizardSectionComponent } from '../setup-wizard-section/setup-wizard-section.component';

@Component({
  selector: 'app-setup-module-form',
  imports: [CommonModule, AccordionModule, SetupWizardSectionComponent],
  templateUrl: './setup-module-form.component.html',
  styleUrl: './setup-module-form.component.scss'
})
export class SetupModuleFormComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpService);
  private readonly confirmation = inject(OpenModalService);
  readonly wizardService = inject(SetupWizardService);
  private readonly wizardNav = inject(SetupWizardNavigationService);
  private readonly stepValidation = inject(SetupWizardStepValidationService);

  currentIndex = 0;
  spinnerLoader = false;
  activeAccordionIndex: number[] = [0];
  readonly canProceed = signal(false);
  readonly missingSectionLabels = signal<string[]>([]);
  readonly isValidatingStep = signal(false);

  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private validationSubscription?: Subscription;

  get currentModule() {
    return this.wizardService.modules()[this.currentIndex];
  }

  get accordions(): SetupWizardAccordion[] {
    return this.currentModule?.accordions ?? [];
  }

  get isFirst(): boolean {
    return this.currentIndex === 0;
  }

  get isLast(): boolean {
    return this.currentIndex === this.wizardService.modules().length - 1;
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.data.subscribe(data => {
      this.applyModuleRoute(data['moduleIndex'] ?? 0);
    });

    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.applyModuleRoute(this.route.snapshot.data['moduleIndex'] ?? 0);
    });

    this.refreshSubscription = this.http.refresh$.subscribe(() => {
      this.validateCurrentStep();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
    this.validationSubscription?.unsubscribe();
  }

  private applyModuleRoute(moduleIndex: number): void {
    if (!this.canAccessStep(moduleIndex)) {
      this.router.navigate(['/setup-wizard', this.wizardService.currentTabRoute()]);
      return;
    }

    this.currentIndex = moduleIndex;
    this.wizardService.syncCurrentTab(this.currentIndex);
    this.wizardNav.setActiveStep(this.currentModule?.route ?? null);
    this.activeAccordionIndex = [0];
    this.validateCurrentStep();
  }

  private validateCurrentStep(): void {
    const moduleRoute = this.currentModule?.route;
    if (!moduleRoute) {
      this.canProceed.set(true);
      this.missingSectionLabels.set([]);
      return;
    }

    this.isValidatingStep.set(true);
    this.validationSubscription?.unsubscribe();
    this.validationSubscription = this.stepValidation.validateModule(moduleRoute).subscribe({
      next: result => {
        this.canProceed.set(result.valid);
        this.missingSectionLabels.set(result.missingLabels);
        this.isValidatingStep.set(false);
      },
      error: () => {
        this.canProceed.set(false);
        this.missingSectionLabels.set([]);
        this.isValidatingStep.set(false);
      }
    });
  }

  private canAccessStep(moduleIndex: number): boolean {
    if (moduleIndex <= this.wizardService.currentModuleIndex()) {
      return true;
    }

    return this.wizardService.modules()[moduleIndex]?.completed ?? false;
  }

  asSectionKey(section: string): SetupWizardSectionKey {
    return section as SetupWizardSectionKey;
  }

  onBack(): void {
    if (this.isFirst || this.spinnerLoader || this.wizardService.isSaving()) {
      return;
    }

    const prevIndex = this.currentIndex - 1;
    const prevModule = this.wizardService.modules()[prevIndex];
    this.spinnerLoader = true;

    this.wizardService.syncCurrentTab(prevIndex);

    this.wizardService.navigateToTab(prevIndex).subscribe({
      next: (result) => {
        if (result) {
          this.router.navigate(['/setup-wizard', prevModule.route]);
        }
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  onNext(): void {
    if (this.spinnerLoader || this.wizardService.isSaving() || this.isValidatingStep()) {
      return;
    }

    if (!this.canProceed()) {
      this.showStepValidationError();
      return;
    }

    if (this.isLast) {
      this.onSubmit();
      return;
    }

    this.spinnerLoader = true;
    const nextModule = this.wizardService.modules()[this.currentIndex + 1];

    this.wizardService.completeTabAndGoNext(this.currentIndex).subscribe({
      next: (result) => {
        if (result && nextModule) {
          this.router.navigate(['/setup-wizard', nextModule.route]);
        }
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  private showStepValidationError(): void {
    const missing = this.missingSectionLabels();
    const message = missing.length
      ? `Please add at least one record in: ${missing.join(', ')}.`
      : 'Please complete all required sections before continuing.';
    this.confirmation.openErrorModal(message);
  }

  private onSubmit(): void {
    if (!this.canProceed()) {
      this.showStepValidationError();
      return;
    }

    this.spinnerLoader = true;

    this.wizardService.finishWizard(this.currentIndex).subscribe({
      next: (result) => {
        if (result) {
          this.router.navigate(['/setup-wizard/complete']);
        }
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }
}
