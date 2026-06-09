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
  //Employee Management
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_employee_management_step',
    moduleTourKey: 'employee-management',
    requiredPermission: 'Employees.view',
    requiredRoute: '/employee-management',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="employee-management"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Cards Management
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_cards_management_step',
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
  },
  //Claims and Expenses Management
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_claimsandexpenses-tabs_step',
    moduleTourKey: 'claimsandexpenses-tabs',
    requiredPermission: 'Expenses.view',
    requiredRoute: '/claimsandexpenses',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="claimsandexpenses-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //IT Support Management
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_itsupport-compoment-tabs_step',
    moduleTourKey: 'itsupport-compoment-tabs',
    requiredPermission: 'IT Support.view',
    requiredRoute: '/it-support/team-tickets',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="itsupport-compoment-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Help Desk Management
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_helpdesk-tabs_step',
    moduleTourKey: 'helpdesk-component-tabs',
    requiredPermission: 'Support Helpdesk Queries Tab.view',
    requiredRoute: '/help-desk/support-desk',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="helpdesk-component-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //PMS
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_pms-tabs_step',
    moduleTourKey: 'krakpi-management-layout-tabs',
    requiredPermission: 'PMS.view',
    requiredRoute: '/pms',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="krakpi-management-layout-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Project Management - Projects
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_projects-tabs_step',
    moduleTourKey: 'project-management-projects-side-tabs',
    requiredPermission: 'Projects.view',
    requiredRoute: '/project-management/projects',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="project-management-projects-side-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Project Management - Phases
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_phases-tabs_step',
    moduleTourKey: 'project-management-phases-side-tabs',
    requiredPermission: 'Project Phases Tab.view',
    requiredRoute: '/project-management/projects/details',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="project-management-phases-side-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Project Management - Client Details
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_client-details-tabs_step',
    moduleTourKey: 'project-management-client-details-tabs',
    requiredPermission: 'Client Projects.view',
    requiredRoute: '/project-management/clients/details',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="project-management-client-details-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Project Management - Timesheets
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_timesheets-tabs_step',
    moduleTourKey: 'project-management-timesheets-tabs',
    requiredPermission: 'Time Sheet.view',
    requiredRoute: '/project-management/timesheet',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="project-management-timesheets-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Letters
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_letters-tabs_step',
    moduleTourKey: 'letter-acknowledgement-documents-tabs',
    requiredPermission: 'Employee Info Documents Tab.view',
    requiredRoute: '/myinfo/documents/letter-acknowledge-documents',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="letter-acknowledgement-documents-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Time Off Leaves
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_leaves-approval-tabs_step',
    moduleTourKey: 'timeoff-leaves-approval-tabs',
    requiredPermission: 'Time Off Module.view',
    requiredRoute: '/time-off/leaves',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="timeoff-leaves-approval-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Time Off WFH
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_wfh-approval-tabs_step',
    moduleTourKey: 'timeoff-wfh-approval-tabs',
    requiredPermission: 'WFH/On Duty Module.view',
    requiredRoute: '/time-off/wfh',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="timeoff-wfh-approval-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Time Off Comp Off
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_comp-off-approval-tabs_step',
    moduleTourKey: 'timeoff-compoff-approval-tabs',
    requiredPermission: 'Comp Off Module.view',
    requiredRoute: '/time-off/comp-off',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="timeoff-compoff-approval-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Time Off Permissions
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_permissions-tabs_step',
    moduleTourKey: 'timeoff-permissions-approval-tabs',
    requiredPermission: 'Permissions Module.view',
    requiredRoute: '/time-off/premissions',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="timeoff-permissions-approval-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Time Off Regularizations
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_regularizations-tabs_step',
    moduleTourKey: 'timeoff-regularization-approval-tabs',
    requiredPermission: 'Regularization Module.view',
    requiredRoute: '/time-off/regularization',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="timeoff-regularization-approval-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Time Off Extra Hours
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_extra-hours-tabs_step',
    moduleTourKey: 'timeoff-extra-hours-approval-tabs',
    requiredPermission: 'Extra Hours Module.view',
    requiredRoute: '/time-off/extra-hours',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="timeoff-extra-hours-approval-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Pending Approvals Time Off
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_pending-approvals-timeoff-tabs_step',
    moduleTourKey: 'pending-approvals-timeoff-tabs',
    requiredPermission: 'Time Off main Tab.view',
    requiredRoute: '/pending-approvals/time-off',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="pending-approvals-timeoff-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Pending Approvals Onboarding
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_pending-approvals-onboarding-tabs_step',
    moduleTourKey: 'pending-approvals-onboarding-tabs',
    requiredPermission: 'Onboarding main Tab.view',
    requiredRoute: '/pending-approvals/on-boarding',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="pending-approvals-onboarding-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //Pending Approvals Offboarding
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_pending-approvals-offboarding-tabs_step',
    moduleTourKey: 'pending-approvals-offboarding-tabs',
    requiredPermission: 'Offboarding main Tab.view',
    requiredRoute: '/pending-approvals/off-boarding',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="pending-approvals-offboarding-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //on behalf of approval time off

  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_on-behalf-of-approval-timeoff-tabs_step',
    moduleTourKey: 'on-behalf-of-approval-timeoff-tabs',
    requiredPermission: 'On Behalf Of Module.view',
    requiredRoute: '/on-behalf-of/on-behalf-of',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="on-behalf-of-approval-timeoff-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //on behalf of WFH
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_on-behalf-of-approval-wfh-tabs_step',
    moduleTourKey: 'on-behalf-of-approval-wfh-tabs',
    requiredPermission: 'On Behalf Of WFH.view',
    requiredRoute: '/on-behalf-of/on-behalf-of-wfh',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="on-behalf-of-approval-wfh-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //on behalf of remote login
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_on-behalf-of-approval-remotelogin-tabs_step',
    moduleTourKey: 'on-behalf-of-remotelogin-tabs',
    requiredPermission: 'On Behalf Of RemoteLogin.view',
    requiredRoute: '/on-behalf-of/on-behalf-of-remotelogin',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="on-behalf-of-remotelogin-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
  //on behalf of expenses
  {
    completionKey: 'subtabs_tour_completed',
    sessionKey: 'dimcon_tour_subtabs_on-behalf-of-approval-remotelogin-tabs_step',
    moduleTourKey: 'on-behalf-of-expenses-tabs',
    requiredPermission: 'On Behalf Of Expenses.view',
    requiredRoute: '/on-behalf-of/on-behalf-of-expenses',
    disableSkip: true,
    finishOnly: true,
    steps: [
      {
        element: '[data-tour="subtabs-dropzone"][data-tour-module="on-behalf-of-expenses-tabs"]',
        popover: {
          title: 'Customize Sub Menu Order',
          description: 'Drag and drop sub-menu tabs to arrange them in your preferred order for quicker access.',
          side: 'right',
          align: 'start'
        }
      }
    ]
  },
];
