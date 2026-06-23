export interface PolicyVisibilitySubModuleOption {
  id?: number;
  key: string;
  label: string;
  sourceValue?: string;
}

export interface PolicyVisibilityModuleOption {
  id?: number;
  key: string;
  label: string;
  sourceValue?: string;
  subModules: PolicyVisibilitySubModuleOption[];
}

export function normalizePolicyVisibilityKey(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface ApplicablePoliciesKeys {
  moduleKey: string;
  subModuleKey: string;
}

export const APPLICABLE_POLICIES_KEYS = {
  //On Behalf Of
  ON_BE_HALF_OF_LEAVES: { moduleKey: 'onbehalf-of', subModuleKey: 'leave' },
  ON_BE_HALF_OF_WFH: { moduleKey: 'onbehalf-of', subModuleKey: 'wfh' },
  ON_BE_HALF_OF_REMOTE_LOGIN: { moduleKey: 'onbehalf-of', subModuleKey: 'remote-login' },
  ON_BE_HALF_OF_GLOBAL_ACTIONS: { moduleKey: 'onbehalf-of', subModuleKey: 'global-actions' },
  ON_BE_HALF_OF_APPROVALS: { moduleKey: 'onbehalf-of', subModuleKey: 'onbehalf-of-approvals' },
  ON_BE_HALF_OF_EXPENSES: { moduleKey: 'onbehalf-of', subModuleKey: 'expenses' },

  //IT Support
  HELP_DESK_TICKETS: { moduleKey: 'it-support', subModuleKey: 'hr-help-desk' },
  IT_SUPORRT_TICKETS: { moduleKey: 'it-support', subModuleKey: 'it-support' },
  PHONE_BOOK: { moduleKey: 'phone-book', subModuleKey: '' },
  ORG_HIERARCHY: { moduleKey: 'org-hierarchy', subModuleKey: '' },
  CLAIMS_AND_EXPENSES: { moduleKey: 'expenses', subModuleKey: '' },
  EVENTS: { moduleKey: 'events', subModuleKey: '' },
  CONTACT_DIRECTORY: { moduleKey: 'contact-directory', subModuleKey: '' },
  DESK_ALLOCATION: { moduleKey: 'desks', subModuleKey: '' },
  CARD_MANAGEMENT: { moduleKey: 'card-management', subModuleKey: '' },
  CALENDAR: { moduleKey: 'calendar', subModuleKey: '' },
  ASSETS: { moduleKey: 'assets', subModuleKey: '' },
  //Employees
  EMPLOYEES_ACTIVE: { moduleKey: 'employees', subModuleKey: 'active' },
  EMPLOYEES_PROSPECTIVE: { moduleKey: 'employees', subModuleKey: 'prospective' },
  EMPLOYEES_PROBATION: { moduleKey: 'employees', subModuleKey: 'probation' },
  EMPLOYEES_INACTIVE: { moduleKey: 'employees', subModuleKey: 'inactive' },

  //Holidays
  HOLIDAYS_OPTIONAL: { moduleKey: 'holidays', subModuleKey: 'optional-holidays' },
  HOLIDAYS_PUBLIC: { moduleKey: 'holidays', subModuleKey: 'public-holidays' },

  ATTENDANCE: { moduleKey: 'attendance', subModuleKey: '' },
 //Time Off
  TIME_OFF_LEAVES: { moduleKey: 'time-off', subModuleKey: 'leave' },
  TIME_OFF_WFH: { moduleKey: 'time-off', subModuleKey: 'wfh' },
  TIME_OFF_COMP_OFF: { moduleKey: 'time-off', subModuleKey: 'comp-off' },
  TIME_OFF_REMOTE_LOGIN: { moduleKey: 'time-off', subModuleKey: 'remote-login' },
  TIME_OFF_EXTRA_HOURS: { moduleKey: 'time-off', subModuleKey: 'extra-hours' },
  TIME_OFF_PERMISSIONS: { moduleKey: 'time-off', subModuleKey: 'permissions' },
  TIME_OFF_REGULARIZATION: { moduleKey: 'time-off', subModuleKey: 'regularization' },

  //Project Management
  PROJECT_MANAGEMENT_CLIENTS: { moduleKey: 'project-management', subModuleKey: 'clients' },
  PROJECT_MANAGEMENT_PROJECTS: { moduleKey: 'project-management', subModuleKey: 'projects' },
  PROJECT_MANAGEMENT_TIMESHEETS: { moduleKey: 'project-management', subModuleKey: 'timesheets' },

  //PMS
  PMS_REVIEW_CYCLE: { moduleKey: 'pms', subModuleKey: 'review-cycle' },
  PMS_PERFORMANCE_REVIEW: { moduleKey: 'pms', subModuleKey: 'performance-review' },
  PMS_KRA: { moduleKey: 'pms', subModuleKey: 'kra' },
  PMS_KPI: { moduleKey: 'pms', subModuleKey: 'kpi' },
  PMS_ASSIGN_KRA_KPI: { moduleKey: 'pms', subModuleKey: 'assign-kra-kpi' },
  PMS_KRA_KPI: { moduleKey: 'pms', subModuleKey: 'kra-kpi' },

  //Pending Approvals
  PENDING_APPROVALS_TIME_OFF: { moduleKey: 'pending-approvals', subModuleKey: 'timeoff' },
  PENDING_APPROVALS_ONBOARDING: { moduleKey: 'pending-approvals', subModuleKey: 'onboarding' },
  PENDING_APPROVALS_CONTRACTORS: { moduleKey: 'pending-approvals', subModuleKey: 'contractors' },
  PENDING_APPROVALS_OFFBOARDING: { moduleKey: 'pending-approvals', subModuleKey: 'offboarding' },
  PENDING_APPROVALS_DESKS: { moduleKey: 'pending-approvals', subModuleKey: 'desks' },
  PENDING_APPROVALS_EXPENSES: { moduleKey: 'pending-approvals', subModuleKey: 'expenses' },
  PENDING_APPROVALS_TIMESHEETS: { moduleKey: 'pending-approvals', subModuleKey: 'timesheets' },
  PENDING_APPROVALS_EMPLOYEE_INFO: { moduleKey: 'pending-approvals', subModuleKey: 'employee-info' },
  PENDING_APPROVALS_KRA_KPI: { moduleKey: 'pending-approvals', subModuleKey: 'kra-kpi' }
} as const satisfies Record<string, ApplicablePoliciesKeys>;
