import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SetupWizardService } from '../../services/setup-wizard.service';

@Component({
  selector: 'app-setup-wizard-stepper',
  imports: [CommonModule],
  templateUrl: './setup-wizard-stepper.component.html',
  styleUrl: './setup-wizard-stepper.component.scss'
})
export class SetupWizardStepperComponent implements OnInit, OnDestroy {
  readonly wizardService = inject(SetupWizardService);
  private readonly router = inject(Router);

  readonly activeStepIndex = signal(0);
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    this.syncActiveStepFromUrl(this.router.url);

    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.syncActiveStepFromUrl(event.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  getStepState(index: number): 'completed' | 'active' | 'inactive' {
    if (index === this.activeStepIndex()) {
      return 'active';
    }

    const modules = this.wizardService.modules();
    if (modules[index]?.completed) {
      return 'completed';
    }

    return 'inactive';
  }

  showStepCheckmark(index: number): boolean {
    const state = this.getStepState(index);
    if (state === 'completed') {
      return true;
    }

    return state === 'active' && Boolean(this.wizardService.modules()[index]?.completed);
  }

  private syncActiveStepFromUrl(url: string): void {
    const match = url.match(/\/setup-wizard\/([^/?#]+)/);
    const route = match?.[1];

    if (!route || route === 'complete') {
      return;
    }

    const index = this.wizardService.getModuleIndexByRoute(route);
    if (index < 0) {
      return;
    }

    this.activeStepIndex.set(index);
    this.wizardService.syncCurrentTab(index);
  }
}
