import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { SetupWizardService } from '../../services/setup-wizard.service';
import { SetupWizardNavigationService } from '../../services/setup-wizard-navigation.service';
import { SetupWizardAccordion, SetupWizardSectionKey } from '../../models/setup-wizard.model';
import { SetupWizardSectionComponent } from '../setup-wizard-section/setup-wizard-section.component';

@Component({
  selector: 'app-setup-module-form',
  imports: [CommonModule, AccordionModule, SetupWizardSectionComponent],
  templateUrl: './setup-module-form.component.html',
  styleUrl: './setup-module-form.component.scss'
})
export class SetupModuleFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly wizardService = inject(SetupWizardService);
  private readonly wizardNav = inject(SetupWizardNavigationService);

  currentIndex = 0;
  spinnerLoader = false;
  activeAccordionIndex: number[] = [0];

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
    this.route.data.subscribe(data => {
      const moduleIndex = data['moduleIndex'] ?? 0;

      if (!this.canAccessStep(moduleIndex)) {
        this.router.navigate(['/setup-wizard', this.wizardService.currentTabRoute()]);
        return;
      }

      this.currentIndex = moduleIndex;
      this.wizardService.syncCurrentTab(this.currentIndex);
      this.wizardNav.setActiveStep(this.currentModule?.route ?? null);
      this.activeAccordionIndex = [0];
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
    if (this.spinnerLoader || this.wizardService.isSaving()) {
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

  private onSubmit(): void {
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
