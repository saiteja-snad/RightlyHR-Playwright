import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { driver, Driver } from 'driver.js';
import { HttpService } from '../../services/http.service';
import { firstValueFrom, Subject } from 'rxjs';
import { UserPreferenceService } from '../../services/user-preference.service';

@Injectable({ providedIn: 'root' })
export class UserTourService {
  private driverObj!: Driver;
  public tourInProgress = false;
  public openEllipsesTrigger = new Subject<void>();
  public closeEllipsesTrigger = new Subject<void>();

  constructor(
    private router: Router,
    private http: HttpService,
    private userPrefService: UserPreferenceService
  ) {
    this.initDriver();
  }

  private initDriver() {
    this.driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      smoothScroll: true,
      doneBtnText: 'Finish',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      popoverClass: 'rhr-tour-popover',
      onNextClick: (element, step, { state }) => {
        const currentStepIndex = this.driverObj.getActiveIndex();

        if (currentStepIndex === 0) {
          // Opening ellipses for Step 2
          this.openEllipsesTrigger.next();
          // Short delay to allow menu to render
          setTimeout(() => {
            this.driverObj.moveNext();
          }, 300);
        } else if (currentStepIndex === 1) {
          // Navigating to Personalization for Step 3
          this.closeEllipsesTrigger.next();
          this.router.navigate(['/menus/personalization']).then(() => {
            // Wait for page to load and data to be fetched
            setTimeout(() => {
              this.driverObj.moveNext();
            }, 800);
          });
        } else {
          this.driverObj.moveNext();
        }
      },
      onPopoverRender: (popover) => {
        // Add Skip button to footer
        const footerButtons = popover.footerButtons;
        if (footerButtons && !footerButtons.querySelector('.rhr-tour-skip-btn')) {
          const skipButton = document.createElement('button');
          skipButton.innerText = 'Skip';
          skipButton.className = 'driver-popover-btn driver-popover-prev-btn rhr-tour-skip-btn';
          skipButton.style.marginRight = 'auto'; // Push other buttons to the right

          skipButton.addEventListener('click', async () => {
  this.tourInProgress = false;

  try {
    await this.completeTour();
  } catch (e) {
    console.error(e);
  }

  this.driverObj.destroy();
});

          // Insert at the beginning of footer buttons
          footerButtons.prepend(skipButton);
        }
      },
      onCloseClick: async () => {
  this.tourInProgress = false;

  try {
    await this.completeTour();
  } catch (e) {
    console.error(e);
  }

  this.driverObj.destroy();
},
      onDestroyed: () => {
  if (this.tourInProgress) {
    this.completeTour();
  }
}
    });
  }

  public async startTour() {
    const steps = [
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

    this.driverObj.setSteps(steps as any);
    this.tourInProgress = true;
    this.driverObj.drive();
  }

  private async completeTour() {
    this.tourInProgress = false;
    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) return;

      const payload = {
        employeeId: employeeId,
        key: 'isTourCompleted',
        value: 'true'
      };

      await firstValueFrom(this.http.postdata('Employeedata/save-user-preference', payload));
      console.log('Tour status saved successfully');
    } catch (error) {
      console.error('Failed to save tour status', error);
    }
  }

  public async checkAndStartTour() {
    try {
      const data = await this.userPrefService.getPreferences();
      if (data && data.isTourCompleted != 'true' && data.isTourCompleted != true) {
        this.startTour();
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  }
}
