import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { driver, Driver } from 'driver.js';
import { HttpService } from '../../services/http.service';
import { firstValueFrom, Subject } from 'rxjs';
import { UserPreferenceService } from '../../services/user-preference.service';

const TOUR_STEP_KEY = 'rhr_tour_active_step';

@Injectable({ providedIn: 'root' })
export class UserTourService implements OnDestroy {
  private driverObj!: Driver;

  public tourInProgress = false;

  public openEllipsesTrigger = new Subject<void>();
  public closeEllipsesTrigger = new Subject<void>();

  private isTourCompletedManually = false;

  constructor(
    private router: Router,
    private http: HttpService,
    private userPrefService: UserPreferenceService
  ) {
    this.initDriver();
  }

  // Arrow function preserves 'this' — used for add/removeEventListener
  private onSkipClickDelegate = (event: MouseEvent) => {
    // No-op — skip is handled directly via skipButton.onclick in onPopoverRender
  };

  private initDriver() {
    this.driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      smoothScroll: true,

      doneBtnText: 'Finish',
      nextBtnText: 'Next',

      showButtons: ['next', 'close'],

      popoverClass: 'rhr-tour-popover',

      onNextClick: async () => {
        const currentStepIndex = this.driverObj.getActiveIndex()!;
        const totalSteps = this.driverObj.getConfig().steps?.length || 0;

        if (currentStepIndex === totalSteps - 1) {
          try {
            this.isTourCompletedManually = true;
            this.tourInProgress = false;
            this.clearPersistedStep();
            await this.completeTour('true');
            this.driverObj.destroy();
          } catch (e) {
            console.error('[Tour] Finish error:', e);
          }
          return;
        }

        if (currentStepIndex === 0) {
          this.openEllipsesTrigger.next();
          setTimeout(() => {
            this.persistStep(1);
            this.driverObj.moveNext();
          }, 300);
          return;
        }

        if (currentStepIndex === 1) {
          this.closeEllipsesTrigger.next();
          this.router.navigate(['/menus/personalization']).then(() => {
            setTimeout(() => {
              this.persistStep(2);
              this.driverObj.moveNext();
            }, 800);
          });
          return;
        }

        const nextIndex = currentStepIndex + 1;
        this.persistStep(nextIndex);
        this.driverObj.moveNext();
      },

      onPopoverRender: (popover: any) => {
        const footerButtons: HTMLElement = popover.footerButtons;
        if (!footerButtons) return;

        const existing = footerButtons.querySelector('.rhr-tour-skip-btn');
        if (existing) existing.remove();

        const skipButton = document.createElement('button');
        skipButton.type = 'button';
        skipButton.innerText = 'Skip';
        skipButton.className = 'driver-popover-btn rhr-tour-skip-btn';
        skipButton.style.marginRight = 'auto';

        // Use capture phase — fires before driver.js wrapper stopImmediatePropagation
        skipButton.addEventListener('click', async (e) => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          e.preventDefault();
          try {
            this.isTourCompletedManually = true;
            this.tourInProgress = false;
            this.clearPersistedStep();
            await this.completeTour('true');
            this.driverObj.destroy();
          } catch (err) {
            console.error('[Tour] Skip error:', err);
          }
        }, true);

        footerButtons.insertBefore(skipButton, footerButtons.firstChild);
      },

      onCloseClick: async () => {
        try {
          this.isTourCompletedManually = true;
          this.tourInProgress = false;
          this.clearPersistedStep();
          await this.completeTour('true');
          this.driverObj.destroy();
        } catch (e) {
          console.error('[Tour] Close error:', e);
        }
      },

      onDestroyed: async () => {
        document.removeEventListener('click', this.onSkipClickDelegate);

        if (this.tourInProgress && !this.isTourCompletedManually) {
          this.clearPersistedStep();
          await this.completeTour('true');
        }

        this.isTourCompletedManually = false;
        this.tourInProgress = false;
      }
    });
  }

  // ── Step persistence ──────────────────────────────────────────────────────

  private persistStep(index: number): void {
    sessionStorage.setItem(TOUR_STEP_KEY, String(index));
  }

  private clearPersistedStep(): void {
    sessionStorage.removeItem(TOUR_STEP_KEY);
  }

  private getPersistedStep(): number | null {
    const val = sessionStorage.getItem(TOUR_STEP_KEY);
    if (val === null) return null;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // ── Tour steps definition ─────────────────────────────────────────────────

  private readonly STEPS: any[] = [
    {
      element: '#ellipses-menu-toggle',
      popover: {
        title: 'Ellipses Menu',
        description: 'Click here to find more modules and personalization options.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#menu-item-Personalization',
      popover: {
        title: 'Personalization',
        description: 'You can customize your menu layout here. Click Next to explore!',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#menus-personalization-tab',
      popover: {
        title: 'Menu Personalization',
        description: 'This is the Menu Personalization section where you can rearrange your sidebar and ellipses menu items.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#draggable-menu-item-tour',
      popover: {
        title: 'Customizable Menus',
        description: 'You can drag and drop items to change their position in the sidebar or move them to the ellipses menu.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#apply-menu-changes-btn',
      popover: {
        title: 'Apply Changes',
        description: 'Once you are happy with your custom layout, click here to save it.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#reset-menu-default-btn',
      popover: {
        title: 'Reset to Default',
        description: 'Changed your mind? You can always reset your menu layout to the original default state.',
        side: 'bottom',
        align: 'start'
      }
    }
  ];

  // ── Public API ────────────────────────────────────────────────────────────

  public async startTour(fromStep = 0): Promise<void> {
    document.removeEventListener('click', this.onSkipClickDelegate);
    document.addEventListener('click', this.onSkipClickDelegate);

    this.driverObj.setSteps(this.STEPS);
    this.tourInProgress = true;
    this.isTourCompletedManually = false;

    this.persistStep(fromStep);
    this.driverObj.drive(fromStep);
  }

  /**
   * Checks tour completion status and either resumes from the persisted step
   * or starts fresh. Handles navigation side-effects for steps that require
   * the user to be on a specific route (e.g. step 1 needs ellipses open,
   * steps 2+ need /menus/personalization).
   */
  public async checkAndStartTour(): Promise<void> {
    try {
      const data = await this.userPrefService.getPreferences();
      if (!data || data.isTourCompleted === 'true' || data.isTourCompleted === true) {
        return;
      }

      const savedStep = this.getPersistedStep();

      if (savedStep === null || savedStep === 0) {
        // Fresh start or reload on step 0
        await this.startTour(0);
        return;
      }

      // Resume from saved step — handle required side-effects per step
      if (savedStep === 1) {
        // Step 1 needs ellipses open
        this.openEllipsesTrigger.next();
        setTimeout(() => this.startTour(1), 300);
        return;
      }

      if (savedStep >= 2) {
        // Steps 2–5 require being on /menus/personalization
        const currentUrl = this.router.url;
        if (!currentUrl.startsWith('/menus/')) {
          await this.router.navigate(['/menus/personalization']);
          setTimeout(() => this.startTour(savedStep), 800);
        } else {
          await this.startTour(savedStep);
        }
        return;
      }

      await this.startTour(savedStep);
    } catch (error) {
      console.error('[Tour] checkAndStartTour error:', error);
    }
  }

  private async completeTour(value: string = 'true'): Promise<void> {
    this.tourInProgress = false;
    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) return;
      const payload = { employeeId, key: 'isTourCompleted', value };
      await firstValueFrom(this.http.postdata('Employeedata/save-user-preference', payload));
    } catch (error) {
      console.error('[Tour] Failed to save tour status', error);
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onSkipClickDelegate);
  }
}
