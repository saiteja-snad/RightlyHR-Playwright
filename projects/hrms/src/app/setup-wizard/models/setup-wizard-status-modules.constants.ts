export type SetupWizardStatusModuleKey =
  | 'shifts'
  | 'holidays'
  | 'weekends'
  | 'policies'
  | 'leave-category';

export type SetupWizardStatusTabId = 'pending' | 'published';

export interface SetupWizardStatusTabConfig {
  id: SetupWizardStatusTabId;
  label: string;
  permission: { feature: string; action: string };
}

export interface SetupWizardStatusModuleConfig {
  apiUrl: string;
  pendingStatus: string;
  publishedStatus: string;
  tabs: SetupWizardStatusTabConfig[];
}

export const SETUP_WIZARD_STATUS_MODULES: Record<
  SetupWizardStatusModuleKey,
  SetupWizardStatusModuleConfig
> = {
  shifts: {
    apiUrl: 'orgShifts',
    pendingStatus: 'Pending for Submission',
    publishedStatus: 'Published',
    tabs: [
      {
        id: 'pending',
        label: 'Pending for Submission',
        permission: { feature: 'Shifts Pending Tab', action: 'view' }
      },
      {
        id: 'published',
        label: 'Published',
        permission: { feature: 'Shifts Published Tab', action: 'view' }
      }
    ]
  },
  holidays: {
    apiUrl: 'orgHolidays',
    pendingStatus: 'Pending for submission',
    publishedStatus: 'Published',
    tabs: [
      {
        id: 'pending',
        label: 'Pending For Submission',
        permission: { feature: 'Holidays Pending Tab', action: 'view' }
      },
      {
        id: 'published',
        label: 'Published',
        permission: { feature: 'Holidays Published Tab', action: 'view' }
      }
    ]
  },
  weekends: {
    apiUrl: 'OrgWeekendHeader/getAll',
    pendingStatus: 'Pending for submission',
    publishedStatus: 'Published',
    tabs: [
      {
        id: 'pending',
        label: 'Pending For Submission',
        permission: { feature: 'Weekends Pending Tab', action: 'view' }
      },
      {
        id: 'published',
        label: 'Published',
        permission: { feature: 'Weekends Published Tab', action: 'view' }
      }
    ]
  },
  policies: {
    apiUrl: 'orgPolicies',
    pendingStatus: 'Pending for submission',
    publishedStatus: 'Published',
    tabs: [
      {
        id: 'pending',
        label: 'Pending For Submission',
        permission: { feature: 'Policies Pending Tab', action: 'view' }
      },
      {
        id: 'published',
        label: 'Published',
        permission: { feature: 'Policies Published Tab', action: 'view' }
      }
    ]
  },
  'leave-category': {
    apiUrl: 'OrgLeavesCategories',
    pendingStatus: 'Pending for submission',
    publishedStatus: 'Published',
    tabs: [
      {
        id: 'pending',
        label: 'Pending For Submission',
        permission: { feature: 'Leave Category Pending Tab', action: 'view' }
      },
      {
        id: 'published',
        label: 'Published',
        permission: { feature: 'Leave Category Published Tab', action: 'view' }
      }
    ]
  }
};
