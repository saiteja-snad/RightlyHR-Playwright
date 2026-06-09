import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { driver, Driver } from 'driver.js';
import { HttpService } from '../../services/http.service';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { UserPreferenceService } from '../../services/user-preference.service';
import { SUB_TABS_TOUR_CONFIGS, TOUR_CONFIGS, TourConfig, TourActionContext } from './tour.config';
import { RbacService } from '../../services/rbac.service';
import { filter } from 'rxjs/operators';

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
  private subTabsTourRouteSub: Subscription | null = null;
  private checkAndStartToursInProgress = false;
  private subTabsStartInProgress = false;
  private scrollLockCleanup: (() => void) | null = null;
  private pendingSubTabsCheck = false;

  constructor(
    private router: Router,
    private http: HttpService,
    private userPrefService: UserPreferenceService,
    private rbac: RbacService

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

        const activeConfig = this.activeTourConfig;
        if (!activeConfig) return;

        const stepConfig = activeConfig.steps[idx];
        this.setTransitioning(true);
        this.setPopoverVisible(false);
        try {
          if (stepConfig?.beforeNext) {
            await stepConfig.beforeNext(this.buildActionContext());
          }

          const nextIndex = idx + 1;
          const ok = await this.prepareStep(activeConfig, nextIndex);
          if (!ok) {
            this.setTransitioning(false);
            this.setPopoverVisible(true);
            return;
          }

          this.applyScrollLockForStep(activeConfig, nextIndex);
          this.persistStep(nextIndex, activeConfig.sessionKey);
          this.driverObj.moveNext();
        } catch {
          this.setTransitioning(false);
          this.setPopoverVisible(true);
        }
      },

      onPopoverRender: (popover: any) => {
        if (popover?.wrapper) popover.wrapper.style.visibility = 'visible';
        this.setTransitioning(false);
        this.setPopoverVisible(true);

        const footerButtons: HTMLElement = popover.footerButtons;
        if (!footerButtons) return;

        const config = this.activeTourConfig;
        const shouldDisableSkip = !!config?.disableSkip;
        const finishOnly = !!config?.finishOnly;

        const existing = footerButtons.querySelector('.rhr-tour-skip-btn');
        if (existing) existing.remove();

        const closeBtn = footerButtons.querySelector('.driver-popover-close-btn') as HTMLElement | null;
        if (closeBtn) closeBtn.style.display = shouldDisableSkip ? 'none' : '';

        const navBtn = footerButtons.querySelector('.driver-popover-next-btn') as HTMLElement | null;
        if (finishOnly && navBtn) navBtn.innerText = 'Finish';

        if (!shouldDisableSkip) {
          const skipBtn = document.createElement('button');
          skipBtn.type = 'button';
          skipBtn.innerText = 'Skip';
          skipBtn.className = 'driver-popover-btn rhr-tour-skip-btn';
          skipBtn.style.marginRight = 'auto';
          footerButtons.insertBefore(skipBtn, footerButtons.firstChild);
        }
      },

      onCloseClick: async () => {
        await this.skipTour();
      },

      onDestroyed: () => {
        this.removeEventListeners();
        this.clearScrollLock();
        this.isTourCompletedManually = false;
        this.tourInProgress = false;
        this.setTransitioning(false);
        setTimeout(() => {
          void this.handlePostTourFlow();
        }, 0);
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

  private async prepareStep(config: TourConfig, stepIndex: number): Promise<boolean> {
    const stepConfig = config.steps[stepIndex];
    if (!stepConfig) return true;

    if (stepConfig.requiredRoute) {
      const currentUrl = this.router.url;
      if (!currentUrl.startsWith(stepConfig.requiredRoute)) {
        await this.router.navigate([stepConfig.requiredRoute]);
      }
    }

    if (stepConfig.beforeShow) {
      await stepConfig.beforeShow(this.buildActionContext());
    }

    const defaultTimeoutMs = config.moduleTourKey ? 8000 : 2000;
    const el = await this.waitForElement(stepConfig.element, stepConfig.waitTimeoutMs ?? defaultTimeoutMs);
    return !!el;
  }

  // ── Tour lifecycle ────────────────────────────────────────────────────────

  private async finishTour(): Promise<void> {
    try {
      this.isTourCompletedManually = true;
      this.tourInProgress = false;
      this.clearPersistedStep();
      this.setTransitioning(false);
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
      this.setTransitioning(false);
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
      if (this.activeTourConfig.moduleTourKey) {
        const prefs = await this.userPrefService.getPreferences();
        const existing = this.parseBooleanMap(prefs?.[this.activeTourConfig.completionKey]);
        const next = { ...existing, [this.activeTourConfig.moduleTourKey]: true };
        const payload = { employeeId, key: this.activeTourConfig.completionKey, value: JSON.stringify(next) };
        await firstValueFrom(this.http.postdata('Employeedata/save-user-preference', payload));

        const cached = this.userPrefService.currentPreferences;
        if (cached) {
          cached[this.activeTourConfig.completionKey] = JSON.stringify(next);
        }
        return;
      }
      const payload = { employeeId, key: this.activeTourConfig.completionKey, value: 'true' };
      await firstValueFrom(this.http.postdata('Employeedata/save-user-preference', payload));
      const cached = this.userPrefService.currentPreferences;
      if (cached) {
        cached[this.activeTourConfig.completionKey] = 'true';
      }
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
    if (this.checkAndStartToursInProgress) return;
    this.checkAndStartToursInProgress = true;
    try {
      this.ensureSubTabsTourRouteWatcher();
      await this.startNextGlobalTour();
    } catch (error) {
      console.error('[Tour] checkAndStartTours error:', error);
    } finally {
      this.checkAndStartToursInProgress = false;
    }
  }

  private async startNextGlobalTour(): Promise<boolean> {
    const prefs = await this.userPrefService.getPreferences();
    for (const config of TOUR_CONFIGS) {
      if (config.requiredPermission && !this.rbac.allowedToAccess(config.requiredPermission)) {
        continue;
      }
      if (this.isTourCompleted(config, prefs)) continue;

      await this.resumeOrStart(config);
      return true;
    }
    return false;
  }

  private async handlePostTourFlow(): Promise<void> {
    if (this.tourInProgress) return;
    if (this.checkAndStartToursInProgress) return;

    try {
      this.ensureSubTabsTourRouteWatcher();
      const startedGlobal = await this.startNextGlobalTour();
      if (!startedGlobal) {
        await this.checkAndStartSubTabsTourForCurrentRoute();
      }
    } catch (error) {
      console.error('[Tour] handlePostTourFlow error:', error);
    }
  }


  private ensureSubTabsTourRouteWatcher(): void {
    if (this.subTabsTourRouteSub) return;
    this.subTabsTourRouteSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        void this.checkAndStartSubTabsTourForCurrentRoute();
      });
    void this.checkAndStartSubTabsTourForCurrentRoute();
  }



  private parseBooleanMap(raw: any): Record<string, boolean> {
    if (!raw) return {};
    if (typeof raw === 'object') return raw as Record<string, boolean>;
    if (typeof raw !== 'string') return {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as Record<string, boolean>;
      return {};
    } catch {
      return {};
    }
  }
  
  private isTourCompleted(config: TourConfig, prefs: any): boolean {
    const raw = prefs?.[config.completionKey];
    if (config.moduleTourKey) {
      const map = this.parseBooleanMap(raw);
      return map?.[config.moduleTourKey] === true;
    }
    return raw === 'true' || raw === true;
  }

  private async checkAndStartSubTabsTourForCurrentRoute(): Promise<void> {
        if (this.tourInProgress || this.subTabsStartInProgress) return;
    if (this.checkAndStartToursInProgress) {
      if (!this.pendingSubTabsCheck) {
        this.pendingSubTabsCheck = true;
        setTimeout(() => {
          this.pendingSubTabsCheck = false;
          void this.checkAndStartSubTabsTourForCurrentRoute();
        }, 0);
      }
      return;
    }
    this.subTabsStartInProgress = true;
    try {
      const prefs = await this.userPrefService.getPreferences();
      const currentUrl = this.router.url;
      const match = SUB_TABS_TOUR_CONFIGS
        .filter(config => {
          if (config.requiredPermission && !this.rbac.allowedToAccess(config.requiredPermission)) return false;
          if (!config.requiredRoute) return false;
          if (!currentUrl.startsWith(config.requiredRoute)) return false;
          if (!config.moduleTourKey) return false;
          return true;
        })
        .sort((a, b) => (b.requiredRoute?.length ?? 0) - (a.requiredRoute?.length ?? 0))[0];
      if (!match) return;
      const moduleKey = match.moduleTourKey;
      if (!moduleKey) return;

       if (this.isTourCompleted(match, prefs)) return;

      await this.resumeOrStart(match);
    } finally {
      this.subTabsStartInProgress = false;
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
    const ok = await this.prepareStep(config, fromStep);
    if (!ok) return;
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
    this.setTransitioning(false);
    this.persistStep(fromStep, config.sessionKey);
    this.applyScrollLockForStep(config, fromStep);
    this.driverObj.drive(fromStep);
  }

  private clearScrollLock(): void {
    try {
      this.scrollLockCleanup?.();
    } finally {
      this.scrollLockCleanup = null;
    }
  }

  private applyScrollLockForStep(config: TourConfig, stepIndex: number): void {
    this.clearScrollLock();
    if (!config.lockScroll) return;
    const step = config.steps?.[stepIndex];
    const selector = step?.element;
    if (!selector) return;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;

    const scrollHost = el.closest('[cdkScrollable], .cdk-scrollable') as HTMLElement | null;
    const prevScrollHostOverflowY = scrollHost?.style.overflowY;
    const prevScrollHostOverflowX = scrollHost?.style.overflowX;

    const prevOverflowY = el.style.overflowY;
    const prevOverflowX = el.style.overflowX;
    const prevScrollbarWidth = (el.style as any).scrollbarWidth;
    const prevMsOverflowStyle = (el.style as any).msOverflowStyle;

    htmlEl.style.overflow = 'hidden';
    bodyEl.style.overflow = 'hidden';

    if (scrollHost) {
      scrollHost.style.overflowY = 'hidden';
      scrollHost.style.overflowX = 'hidden';
    }

    el.style.overflowY = 'hidden';
    el.style.overflowX = 'hidden';
    (el.style as any).scrollbarWidth = 'none';
    (el.style as any).msOverflowStyle = 'none';

    this.scrollLockCleanup = () => {
      htmlEl.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
      if (scrollHost) {
        scrollHost.style.overflowY = prevScrollHostOverflowY ?? '';
        scrollHost.style.overflowX = prevScrollHostOverflowX ?? '';
      }
      el.style.overflowY = prevOverflowY;
      el.style.overflowX = prevOverflowX;
      (el.style as any).scrollbarWidth = prevScrollbarWidth;
      (el.style as any).msOverflowStyle = prevMsOverflowStyle;
    };
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

  private setTransitioning(transitioning: boolean): void {
    document.body.classList.toggle('rhr-tour-transitioning', transitioning);
  }

  private setPopoverVisible(visible: boolean): void {
    const el = document.getElementById('driver-popover-content') as HTMLElement | null;
    if (el) el.style.visibility = visible ? 'visible' : 'hidden';
  }

  private isElementVisible(el: Element): boolean {
    const htmlEl = el as HTMLElement;
    if (htmlEl.offsetParent === null && getComputedStyle(htmlEl).position !== 'fixed') return false;
    const style = getComputedStyle(htmlEl);
    if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return false;
    return el.getClientRects().length > 0;
  }

  public async waitForElement(selector: string, timeoutMs = 1500): Promise<Element | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const el = document.querySelector(selector);
      if (el && this.isElementVisible(el)) return el;
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

  private onWheel = (e: WheelEvent) => {
    if (!this.tourInProgress) return;
    const target = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as Element | null;
    const isInsidePopover = !!target?.closest('#driver-popover-content');
    if (isInsidePopover) return;

    if (this.activeTourConfig?.lockScroll) {
      e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
      return;
    }

    const idx = this.driverObj.getActiveIndex();
    if (idx !== 1) return;

    if (target?.closest('.ellipses-dropdown-menu')) {
      e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.tourInProgress) return;
    if (!this.activeTourConfig?.lockScroll) return;
    const target = (e.target instanceof Element ? e.target : (e.target as any)?.parentElement) as Element | null;
    const isInsidePopover = !!target?.closest('#driver-popover-content');
    if (isInsidePopover) return;
    e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.tourInProgress) return;
    if (!this.activeTourConfig?.lockScroll) return;
    const target = (e.target instanceof Element ? e.target : null) as Element | null;
    const isInsidePopover = !!target?.closest('#driver-popover-content');
    if (isInsidePopover) return;

    const key = e.key;
    const isScrollKey =
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'PageUp' ||
      key === 'PageDown' ||
      key === 'Home' ||
      key === 'End' ||
      key === ' ' ||
      key === 'Spacebar';
    if (!isScrollKey) return;
    e.stopImmediatePropagation(); e.stopPropagation(); e.preventDefault();
  };

  private onSkipClick = (e: MouseEvent) => {
    if (!this.tourInProgress) return;
    if (!e.isTrusted) return;
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
    document.addEventListener('wheel', this.onWheel, { capture: true, passive: false });
    document.addEventListener('touchmove', this.onTouchMove, { capture: true, passive: false });
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('click', this.onSkipClick, true);
  }

  private removeEventListeners(): void {
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    document.removeEventListener('dblclick', this.onDblClick, true);
    document.removeEventListener('wheel', this.onWheel, { capture: true } as any);
    document.removeEventListener('touchmove', this.onTouchMove, { capture: true } as any);
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.removeEventListener('click', this.onSkipClick, true);
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }
}
