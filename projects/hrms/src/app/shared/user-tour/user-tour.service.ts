import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { driver, Driver } from 'driver.js';
import { HttpService } from '../../services/http.service';
import { firstValueFrom, Subject } from 'rxjs';
import { UserPreferenceService } from '../../services/user-preference.service';
import { TOUR_CONFIGS, TourConfig, TourActionContext } from './tour.config';

@Injectable({ providedIn: 'root' })
export class UserTourService implements OnDestroy {

  // ── Subjects consumed by the sidenav component ────────────────────────────
  public openEllipsesTrigger = new Subject<void>();
  public closeEllipsesTrigger = new Subject<void>();

  // ── Engine state ──────────────────────────────────────────────────────────
  public tourInProgress = false;
  private driverObj!: Driver;
  private activeTourConfig: TourConfig | null = null;
  private isTourCompletedManually = false;

  constructor(
    private router: Router,
    private http: HttpService,
    private userPrefService: UserPreferenceService
  ) {
    this.initDriver();
  }

  // ── Driver.js initialisation ──────────────────────────────────────────────

  private initDriver(): void {
    this.driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      overlayClickBehavior: () => {},
      smoothScroll: true,
      doneBtnText: 'Finish',
      nextBtnText: 'Next',
      showButtons: ['next', 'close'],
      popoverClass: 'rhr-tour-popover',

      onNextClick: async () => {
        const idx = this.driverObj.getActiveIndex()!;
        const total = this.driverObj.getConfig().steps?.length || 0;

        if (idx === total - 1) {
          await this.finishTour();
          return;
        }

        // Run the current step's beforeNext hook if defined
        const stepConfig = this.activeTourConfig?.steps[idx];
        if (stepConfig?.beforeNext) {
          this.setPopoverVisible(false);
          try {
            await stepConfig.beforeNext(this.buildActionContext());
          } finally {
            this.setPopoverVisible(true);
          }
        }

        this.persistStep(idx + 1);
        this.driverObj.moveNext();
      },

      onPopoverRender: (popover: any) => {
        if (popover?.wrapper) popover.wrapper.style.visibility = 'visible';

        const footerButtons: HTMLElement = popover.footerButtons;
        if (!footerButtons) return;

        const existing = footerButtons.querySelector('.rhr-tour-skip-btn');
        if (existing) existing.remove();

        const skipBtn = document.createElement('button');
        skipBtn.type = 'button';
        skipBtn.innerText = 'Skip';
        skipBtn.className = 'driver-popover-btn rhr-tour-skip-btn';
        skipBtn.style.marginRight = 'auto';
        // Click handled by onSkipClick capture listener on document
        footerButtons.insertBefore(skipBtn, footerButtons.firstChild);
      },

      onCloseClick: async () => {
        await this.skipTour();
      },

      onDestroyed: () => {
        this.removeEventListeners();
        this.isTourCompletedManually = false;
        this.tourInProgress = false;
      }
    });
  }

  // ── Action context passed to step hooks ───────────────────────────────────

  private buildActionContext(): TourActionContext {
    return {
      navigate: (route) => this.router.navigate([route]),
      openEllipses: () => this.openEllipsesTrigger.next(),
      closeEllipses: () => this.closeEllipsesTrigger.next(),
      waitForElement: (selector, timeoutMs) => this.waitForElement(selector, timeoutMs)
    };
  }

  // ── Tour lifecycle ────────────────────────────────────────────────────────

  private async finishTour(): Promise<void> {
    try {
      this.isTourCompletedManually = true;
      this.tourInProgress = false;
      this.clearPersistedStep();
      await this.saveTourCompletion();
      this.driverObj.destroy();
    } catch (e) {
      console.error('[Tour] Finish error:', e);
    }
  }

  private async skipTour(): Promise<void> {
    try {
      this.isTourCompletedManually = true;
      this.tourInProgress = false;
      this.clearPersistedStep();
      await this.saveTourCompletion();
      this.driverObj.destroy();
    } catch (e) {
      console.error('[Tour] Skip error:', e);
    }
  }

  private async saveTourCompletion(): Promise<void> {
    if (!this.activeTourConfig) return;
    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) return;
      const payload = { employeeId, key: this.activeTourConfig.completionKey, value: 'true' };
      await firstValueFrom(this.http.postdata('Employeedata/save-user-preference', payload));
    } catch (error) {
      console.error('[Tour] Failed to save tour completion:', error);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Entry point called after login.
   * Fetches all user preferences once, then checks each tour config.
   * Shows the first incomplete tour found.
   */
  public async checkAndStartTours(): Promise<void> {
    try {
      const prefs = await this.userPrefService.getPreferences();

      for (const config of TOUR_CONFIGS) {
        const isCompleted = prefs?.[config.completionKey];
        if (isCompleted === 'true' || isCompleted === true) continue;

        // Found an incomplete tour — resume or start it
        await this.resumeOrStart(config);
        return; // Show one tour at a time
      }
    } catch (error) {
      console.error('[Tour] checkAndStartTours error:', error);
    }
  }

  /**
   * Resumes from the persisted step or starts from step 0.
   * Handles any required navigation/side-effects before driving.
   */
  private async resumeOrStart(config: TourConfig): Promise<void> {
    this.activeTourConfig = config;
    const savedStep = this.getPersistedStep(config.sessionKey);
    const fromStep = savedStep ?? 0;

    if (fromStep === 0) {
      await this.startTour(config, 0);
      return;
    }

    // Restore required state for the saved step
    const stepConfig = config.steps[fromStep];
    if (stepConfig?.requiredRoute) {
      const currentUrl = this.router.url;
      if (!currentUrl.startsWith(stepConfig.requiredRoute)) {
        await this.router.navigate([stepConfig.requiredRoute]);
        await this.waitForElement(stepConfig.element, 1500);
      }
    }

    await this.startTour(config, fromStep);
  }

  private async startTour(config: TourConfig, fromStep: number): Promise<void> {
    this.activeTourConfig = config;
    this.addEventListeners();

    // Map TourStepConfig → driver.js step format
    const driverSteps = config.steps.map(s => ({
      element: s.element,
      popover: s.popover
    }));

    this.driverObj.setSteps(driverSteps as any);
    this.tourInProgress = true;
    this.isTourCompletedManually = false;
    this.persistStep(fromStep, config.sessionKey);
    this.driverObj.drive(fromStep);
  }

  // ── Step persistence ──────────────────────────────────────────────────────

  private persistStep(index: number, key?: string): void {
    const storageKey = key ?? this.activeTourConfig?.sessionKey;
    if (storageKey) sessionStorage.setItem(storageKey, String(index));
  }

  private clearPersistedStep(): void {
    if (this.activeTourConfig?.sessionKey) {
      sessionStorage.removeItem(this.activeTourConfig.sessionKey);
    }
  }

  private getPersistedStep(sessionKey: string): number | null {
    const val = sessionStorage.getItem(sessionKey);
    if (val === null) return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // ── DOM helpers ───────────────────────────────────────────────────────────

  private setPopoverVisible(visible: boolean): void {
    const el = document.getElementById('driver-popover-content') as HTMLElement | null;
    if (el) el.style.visibility = visible ? 'visible' : 'hidden';
  }

  public async waitForElement(selector: string, timeoutMs = 1500): Promise<Element | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const el = document.querySelector(selector);
      if (el) return el;
      await new Promise<void>(r => setTimeout(r, 50));
    }
    return null;
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  private onPointerDown = (e: PointerEvent) => {
    if (!this.tourInProgress) return;
    const target = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as Element | null;
    if (!target?.closest('#driver-popover-content')) {
      e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
    }
  };

  private onDblClick = (e: MouseEvent) => {
    if (!this.tourInProgress) return;
    const target = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as Element | null;
    if (!target?.closest('#driver-popover-content')) {
      e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
    }
  };

  private onSkipClick = (e: MouseEvent) => {
    if (!this.tourInProgress) return;
    const target = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as Element | null;
    const isInsidePopover = !!target?.closest('#driver-popover-content');
    if (!isInsidePopover) {
      e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
      return;
    }
    const skipBtn = target?.closest('.rhr-tour-skip-btn') as HTMLElement | null;
    if (!skipBtn) return;
    e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
    void this.skipTour();
  };

  private addEventListeners(): void {
    this.removeEventListeners();
    document.addEventListener('pointerdown', this.onPointerDown, true);
    document.addEventListener('dblclick', this.onDblClick, true);
    document.addEventListener('click', this.onSkipClick, true);
  }

  private removeEventListeners(): void {
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    document.removeEventListener('dblclick', this.onDblClick, true);
    document.removeEventListener('click', this.onSkipClick, true);
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }
}
