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
      this.currentIndex = data['moduleIndex'] ?? 0;
      this.wizardService.setCurrentModule(this.currentIndex);
      this.wizardNav.setActiveStep(this.currentModule?.route ?? null);
      this.activeAccordionIndex = [0];
    });
  }

  asSectionKey(section: string): SetupWizardSectionKey {
    return section as SetupWizardSectionKey;
  }

  onBack(): void {
    if (!this.isFirst) {
      const prevModule = this.wizardService.modules()[this.currentIndex - 1];
      this.router.navigate(['/setup-wizard', prevModule.route]);
    }
  }

  onNext(): void {
    if (this.isLast) {
      this.onSubmit();
      return;
    }
    this.wizardService.markModuleComplete(this.currentIndex);
    const nextModule = this.wizardService.modules()[this.currentIndex + 1];
    this.router.navigate(['/setup-wizard', nextModule.route]);
  }

  private onSubmit(): void {
    this.spinnerLoader = true;
    this.wizardService.markModuleComplete(this.currentIndex);
    setTimeout(() => {
      this.spinnerLoader = false;
      this.router.navigate(['/setup-wizard/complete']);
    }, 600);
  }
}
