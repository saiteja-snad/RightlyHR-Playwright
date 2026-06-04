/**
 * tour.config.ts
 *
 * Centralized configuration for all guided tours in the application.
 * To add a new tour, simply add a new TourConfig object to TOUR_CONFIGS.
 * The UserTourService engine handles all execution automatically.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TourStepConfig {
  /** CSS selector for the element to highlight */
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'top' | 'right' | 'bottom' | 'left' | 'over';
    align?: 'start' | 'center' | 'end';
  };
  waitTimeoutMs?: number;
  beforeShow?: (ctx: TourActionContext) => Promise<void>;
  /**
   * Optional side-effect to run BEFORE moving to the NEXT step.
   * The engine calls this and waits for it to resolve before advancing.
   * Receives the service's action context so it can trigger subjects/navigation.
   */
  beforeNext?: (ctx: TourActionContext) => Promise<void>;
  /**
   * Optional route that must be active for this step to render correctly.
   * If the current URL does not start with this value, the engine navigates there first.
   */
  requiredRoute?: string;
}

export interface TourConfig {
  /** Unique key used as the DB preference key (e.g. 'isTourCompleted') */
  completionKey: string;
  /** sessionStorage key for persisting the active step across reloads */
  sessionKey: string;
  /** All steps for this tour */
  steps: TourStepConfig[];

  requiredPermission?: string;
  moduleTourKey?: string;
  requiredRoute?: string;
  disableSkip?: boolean;
  finishOnly?: boolean;
  lockScroll?: boolean;
}

/** Context passed to step beforeNext hooks so they can trigger app-level actions */
export interface TourActionContext {
  navigate: (route: string) => Promise<boolean>;
  openEllipses: () => void;
  closeEllipses: () => void;
  waitForElement: (selector: string, timeoutMs?: number) => Promise<Element | null>;
}

// ── Tour Configurations ───────────────────────────────────────────────────────

export const TOUR_CONFIGS: TourConfig[] = [
  {
    completionKey: 'menu_personalization_tour_completed',
    sessionKey: 'rhr_tour_menu_personalization_step',
    requiredPermission: 'Themes.view',
    steps: [
      {
        element: '#ellipses-menu-toggle',
        popover: {
          title: 'Access Additional Modules',
          description: 'Click the Ellipses (...) option in the RightlyHR sidebar to access additional modules and personalization settings.',
          side: 'right',
          align: 'start'
        },
        beforeNext: async (ctx) => {
          ctx.openEllipses();
          await new Promise<void>(r => setTimeout(r, 300));
        }
      },
      {
        element: '#menu-item-Personalization',
        popover: {
          title: 'Open Personalization',
          description: 'Select the Personalization menu to customize the appearance and navigation layout of your RightlyHR portal.',
          side: 'right',
          align: 'start'
        },
        beforeShow: async (ctx) => {
          ctx.openEllipses();
          await new Promise<void>(r => setTimeout(r, 300));
        },
        beforeNext: async (ctx) => {
          ctx.closeEllipses();
          await ctx.navigate('/menus/personalization');
          await ctx.waitForElement('#menus-personalization-tab', 2000);
        }
      },
      {
        element: '#menus-personalization-tab',
        requiredRoute: '/menus/personalization',
        popover: {
          title: 'Navigate to Menu Personalization',
          description: 'Click on the Menu Personalization tab to manage the menus displayed in the application sidebar.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#draggable-menu-item-tour',
        requiredRoute: '/menus/personalization',
        popover: {
          title: 'Rearrange Menu Items',
          description: 'Drag and drop menu items between the Primary Menu and Ellipses Menu to organize modules based on your daily usage and preference.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#apply-menu-changes-btn',
        requiredRoute: '/menus/personalization',
        popover: {
          title: 'Apply Menu Changes',
          description: 'After updating the menu arrangement, click on the Apply Changes button to save and reflect the changes in the application sidebar.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#reset-menu-default-btn',
        requiredRoute: '/menus/personalization',
        popover: {
          title: 'Reset Default Layout',
          description: 'Click on the Reset to Default button to restore the original RightlyHR menu configuration and layout.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#main-sidebar',
        requiredRoute: '/menus/personalization',
        popover: {
          title: 'Customize Side Navigation Menu',
          description: 'Users can customize both the Side Navigation Menu and the Ellipses Menu (...) by organizing and managing the menu items based on their preference and frequently used modules.',
          side: 'right',
          align: 'center'
        }
      }
    ]
  }
];

export const SUB_TABS_TOUR_CONFIGS: TourConfig[] = [
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'rhr_tour_subtabs_cards_management_step',
    moduleTourKey: 'cardsmanagement-tabs',
    requiredPermission: 'Cards Management.view',
    requiredRoute: '/card-management',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="cardsmanagement-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  }
];
