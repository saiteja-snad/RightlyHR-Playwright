export type QuickLinkPermission = { feature: string; action: string };

export interface QuickLinkRouteDef {
  route: string;
  label: string;
  icon: string;
  permission: QuickLinkPermission;
  parentRoute?: string;
}

export interface QuickLinksSourceDef {
  route: string;
  type: 'direct' | 'dropdown';
  children?: string[];
  permission?: QuickLinkPermission;
}

export interface QuickLinksResolveContext {
  allowWFH?: boolean;
  allowRemoteLogin?: boolean;
}

export const QUICK_LINK_ROUTES: Record<string, QuickLinkRouteDef> = {
  '/myinfo/personal/basic-info': {
    route: '/myinfo/personal/basic-info',
    label: 'My Info',
    icon: '/dashboard-icon/personal-information.png',
    permission: { feature: 'My Info', action: 'view' }
  },
  '/holidays/public-holidays': {
    route: '/holidays/public-holidays',
    label: 'Holidays',
    icon: '/main-menu-icons/holiday-icon.png',
    permission: { feature: 'Holidays', action: 'view' }
  },
  '/employee-management': {
    route: '/employee-management',
    label: 'Employees',
    icon: '/personalization/Ellipses_Employees.png',
    permission: { feature: 'Employees', action: 'view' }
  },
  '/attendance': {
    route: '/attendance',
    label: 'Attendance',
    icon: '/personalization/Ellipses_Attendance.png',
    permission: { feature: 'Attendance', action: 'view' }
  },
  '/reports': {
    route: '/reports',
    label: 'Reports',
    icon: '/personalization/Ellipses_Reports.png',
    permission: { feature: 'Reports', action: 'view' }
  },
  '/skill-management/dashboard': {
    route: '/skill-management/dashboard',
    label: 'Skill Set',
    icon: '/personalization/Ellipses_Skill Set.png',
    permission: { feature: 'Skills Dashboard', action: 'view' }
  },
  '/policies/companypolicies': {
    route: '/policies/companypolicies',
    label: 'Policies',
    icon: '/main-menu-icons/policies-icon.png',
    permission: { feature: 'Policies', action: 'view' }
  },
  '/events': {
    route: '/events',
    label: 'Events',
    icon: '/main-menu-icons/events-colored-icon.png',
    permission: { feature: 'Events', action: 'view' }
  },
  '/events/upcoming': {
    route: '/events/upcoming',
    label: 'Events',
    icon: '/main-menu-icons/events-colored-icon.png',
    permission: { feature: 'Events(Upcoming Events)', action: 'view' }
  },
  '/claimsandexpenses': {
    route: '/claimsandexpenses',
    label: 'Expenses',
    icon: '/main-menu-icons/expenses-icon.png',
    permission: { feature: 'Expenses', action: 'view' }
  },
  '/claimsandexpenses/expenses': {
    route: '/claimsandexpenses/expenses',
    label: 'Expenses',
    icon: '/main-menu-icons/expenses-icon.png',
    permission: { feature: 'Draft Tab', action: 'view' }
  },
  '/organization-chart': {
    route: '/organization-chart',
    label: 'Org Hierarchy',
    icon: '/main-menu-icons/org.png',
    permission: { feature: 'Org Hierarchy', action: 'view' }
  },
  '/theme': {
    route: '/theme',
    label: 'Personalization',
    icon: '/main-menu-icons/themes-color-icon.png',
    permission: { feature: 'Themes', action: 'view' }
  },
  '/theme/selection': {
    route: '/theme/selection',
    label: 'Personalization',
    icon: '/main-menu-icons/themes-color-icon.png',
    permission: { feature: 'Themes', action: 'view' }
  },
  '/blood-bank': {
    route: '/blood-bank',
    label: 'Blood Bank',
    icon: '/main-menu-icons/blood-bank-color-icon.png',
    permission: { feature: 'Blood Bank', action: 'view' }
  },
  '/contacts-directory': {
    route: '/contacts-directory',
    label: 'Contacts Directory',
    icon: '/main-menu-icons/contact-directory-color-icon.png',
    permission: { feature: 'Contacts Directory', action: 'view' }
  },
  '/phonebook': {
    route: '/phonebook',
    label: 'Phone Book',
    icon: '/main-menu-icons/phonebook-color-icon.png',
    permission: { feature: 'Phone Book', action: 'view' }
  },
  '/assets-management': {
    route: '/assets-management',
    label: 'Assets',
    icon: '/main-menu-icons/assets-icon.png',
    permission: { feature: 'Asset Management', action: 'view' }
  },
  '/assets-management/available-assets': {
    route: '/assets-management/available-assets',
    label: 'Assets',
    icon: '/main-menu-icons/assets-icon.png',
    permission: { feature: 'Asset Management - Available', action: 'view' }
  },
  '/card-management': {
    route: '/card-management',
    label: 'Cards Management',
    icon: '/main-menu-icons/card-management-icon.png',
    permission: { feature: 'Cards Management', action: 'view' }
  },
  '/card-management/details': {
    route: '/card-management/details',
    label: 'Cards Management',
    icon: '/main-menu-icons/card-management-icon.png',
    permission: { feature: 'Cards Available', action: 'view' }
  },
  '/desk/management/available-desks': {
    route: '/desk/management/available-desks',
    label: 'Desk Allocation',
    icon: '/main-menu-icons/desk-icon.png',
    permission: { feature: 'Desk Allocation - Available', action: 'view' }
  },
  '/calendar-view': {
    route: '/calendar-view',
    label: 'Calendar',
    icon: '/dashboard-icon/calendar.png',
    permission: { feature: 'Calendar', action: 'view' }
  },


  //Time Off

  '/time-off/leaves/waiting-for-approval': {
    route: '/time-off/leaves/waiting-for-approval',
    label: 'Leaves',
    icon: '/time-off-icon/leaves-icon.png',
    permission: { feature: 'Time Off Module', action: 'view' },
    parentRoute: '/time-off'
  },
  '/time-off/wfh/waiting-for-approval': {
    route: '/time-off/wfh/waiting-for-approval',
    label: 'WFH',
    icon: '/time-off-icon/WFH-icon.png',
    permission: { feature: 'WFH/On Duty Module', action: 'view' },
    parentRoute: '/time-off'
  },
  '/time-off/remote/waiting-for-approval': {
    route: '/time-off/remote/waiting-for-approval',
    label: 'Remote Login',
    icon: '/time-off-icon/remote-login-icon.png',
    permission: { feature: 'Remote Login Module', action: 'view' },
    parentRoute: '/time-off'
  },
  '/time-off/premissions/waiting-for-approval': {
    route: '/time-off/premissions/waiting-for-approval',
    label: 'Permissions',
    icon: '/time-off-icon/permissions-icon.png',
    permission: { feature: 'Permissions Module', action: 'view' },
    parentRoute: '/time-off'
  },
  '/time-off/comp-off/waiting-for-approval': {
    route: '/time-off/comp-off/waiting-for-approval',
    label: 'Comp Off',
    icon: '/time-off-icon/comp-off.png',
    permission: { feature: 'Comp Off Module', action: 'view' },
    parentRoute: '/time-off'
  },
  '/time-off/regularization/waiting-for-approval': {
    route: '/time-off/regularization/waiting-for-approval',
    label: 'Regularization',
    icon: '/time-off-icon/regularization-icon.png',
    permission: { feature: 'Regularization Module', action: 'view' },
    parentRoute: '/time-off'
  },
  '/time-off/extra-hours/waiting-for-approval': {
    route: '/time-off/extra-hours/waiting-for-approval',
    label: 'Extra Hours',
    icon: '/time-off-icon/extra-logs.png',
    permission: { feature: 'Extra Hours Module', action: 'view' },
    parentRoute: '/time-off'
  },

  //Pending Approvals

  '/pending-approvals/time-off': {
    route: '/pending-approvals/time-off',
    label: 'PA-Time Off',
    icon: '/main-menu-icons/Time-off-settings-icon.png',
    permission: { feature: 'Time Off main Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/on-boarding': {
    route: '/pending-approvals/on-boarding',
    label: 'PA-Onboarding',
    icon: '/images/onboarding.png',
    permission: { feature: 'Onboarding main Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/contractors': {
    route: '/pending-approvals/contractors',
    label: 'PA-Contractors',
    icon: '/my-info-icons/contractor.png',
    permission: { feature: 'Contractors main Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/off-boarding': {
    route: '/pending-approvals/off-boarding',
    label: 'PA-Offboarding',
    icon: '/images/sepration-request.png',
    permission: { feature: 'Offboarding main Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/desk-approval': {
    route: '/pending-approvals/desk-approval',
    label: 'PA-Desks',
    icon: '/main-menu-icons/desk-icon.png',
    permission: { feature: 'Desk Requests Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/claimsandexpenses-request': {
    route: '/pending-approvals/claimsandexpenses-request',
    label: 'PA-Expenses',
    icon: '/main-menu-icons/expenses-icon.png',
    permission: { feature: 'Claims and Expenses Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/time-sheets': {
    route: '/pending-approvals/time-sheets',
    label: 'PA-Timesheets',
    icon: '/time-off-icon/calender-activity.png',
    permission: { feature: 'Time Sheet approval Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/employeeinfo-request': {
    route: '/pending-approvals/employeeinfo-request',
    label: 'PA-Employee Info',
    icon: '/time-off-icon/employee-info-approvals.png',
    permission: { feature: 'EmployeeInfo Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },
  '/pending-approvals/kra-kpi': {
    route: '/pending-approvals/kra-kpi',
    label: "PA-KRA/KPI's",
    icon: '/main-menu-icons/kra-kpi.png',
    permission: { feature: 'KRA KPI approval Tab', action: 'view' },
    parentRoute: '/pending-approvals'
  },

  //Project Management

  '/project-management/clients': {
    route: '/project-management/clients',
    label: 'Clients',
    icon: 'main-menu-icons/project-management-client.png',
    permission: { feature: 'Clients', action: 'view' },
    parentRoute: '/project-management'
  },
  '/project-management/projects': {
    route: '/project-management/projects',
    label: 'Projects',
    icon: 'main-menu-icons/project-management-project.png',
    permission: { feature: 'Projects', action: 'view' },
    parentRoute: '/project-management'
  },
  '/project-management/timesheet': {
    route: '/project-management/timesheet',
    label: 'Timesheets',
    icon: 'main-menu-icons/project-management-timesheet.png',
    permission: { feature: 'Time Sheet', action: 'view' },
    parentRoute: '/project-management'
  },

  //On Behalf Of

  '/on-behalf-of/on-behalf-of': {
    route: '/on-behalf-of/on-behalf-of',
    label: 'On Behalf Of-Leaves',
    icon: '/time-off-icon/on-behalf-of-icon.png',
    permission: { feature: 'On Behalf Of Module', action: 'view' },
    parentRoute: '/on-behalf-of'
  },
  '/on-behalf-of/on-behalf-of-wfh': {
    route: '/on-behalf-of/on-behalf-of-wfh',
    label: 'On Behalf Of-WFH',
    icon: '/time-off-icon/WFH-icon.png',
    permission: { feature: 'On Behalf Of WFH', action: 'view' },
    parentRoute: '/on-behalf-of'
  },
  '/on-behalf-of/on-behalf-of-remotelogin': {
    route: '/on-behalf-of/on-behalf-of-remotelogin',
    label: 'On Behalf Of-Remote Login',
    icon: '/time-off-icon/RemoteLogin-icon.png',
    permission: { feature: 'On Behalf Of RemoteLogin', action: 'view' },
    parentRoute: '/on-behalf-of'
  },
  '/on-behalf-of/global/permissions': {
    route: '/on-behalf-of/global/permissions',
    label: 'On Behalf Of-Global Actions',
    icon: '/time-off-icon/Global-Permissions-icon.png',
    permission: { feature: 'Global Permissions Module', action: 'view' },
    parentRoute: '/on-behalf-of'
  },
  '/on-behalf-of/on-behalf-of-approvals': {
    route: '/on-behalf-of/on-behalf-of-approvals',
    label: 'On Behalf Of Approvals',
    icon: '/time-off-icon/on-behalf-of-approvals-icon.png',
    permission: { feature: 'On Behalf Of Approvals Module', action: 'view' },
    parentRoute: '/on-behalf-of'
  },
  '/on-behalf-of/on-behalf-of-expenses': {
    route: '/on-behalf-of/on-behalf-of-expenses',
    label: 'On Behalf Of-Expenses',
    icon: '/main-menu-icons/expenses-icon.png',
    permission: { feature: 'On Behalf Of Expenses', action: 'view' },
    parentRoute: '/on-behalf-of'
  },

  //PMS

  '/pms/review-cycle': {
    route: '/pms/review-cycle',
    label: 'Review Cycle',
    icon: 'main-menu-icons/review-cycle.png',
    permission: { feature: 'Review Cycle List', action: 'view' },
    parentRoute: '/pms'
  },
  '/pms/performace-review/myPerformance/pending-review': {
    route: '/pms/performace-review/myPerformance/pending-review',
    label: 'Performance Review',
    icon: 'main-menu-icons/performance-review.png',
    permission: { feature: 'My Performance Review', action: 'view' },
    parentRoute: '/pms'
  },
  '/pms/kra': {
    route: '/pms/kra',
    label: 'KRA',
    icon: 'main-menu-icons/kra.png',
    permission: { feature: 'KRA', action: 'view' },
    parentRoute: '/pms'
  },
  '/pms/kpi': {
    route: '/pms/kpi',
    label: 'KPI',
    icon: 'main-menu-icons/kpi.png',
    permission: { feature: 'KPI', action: 'view' },
    parentRoute: '/pms'
  },
  '/pms/assign-kra-kpi': {
    route: '/pms/assign-kra-kpi',
    label: 'Assign KRA/KPI',
    icon: 'main-menu-icons/assign-kra-kpi.png',
    permission: { feature: 'Assign KRA KPI', action: 'view' },
    parentRoute: '/pms'
  },
  '/pms/kpi-kra': {
    route: '/pms/kpi-kra',
    label: "KRA/KPI's",
    icon: 'main-menu-icons/my-kra-kpi.png',
    permission: { feature: 'My KRA KPI', action: 'view' },
    parentRoute: '/pms'
  }
};

export const QUICK_LINK_SOURCES: Record<string, QuickLinksSourceDef> = {
  '/myinfo': { route: '/myinfo', type: 'direct', permission: { feature: 'My Info', action: 'view' } },
  '/employee-management': { route: '/employee-management', type: 'direct', permission: { feature: 'Employees', action: 'view' } },
  '/holidays': { route: '/holidays', type: 'direct', permission: { feature: 'Holidays', action: 'view' } },
  '/attendance': { route: '/attendance', type: 'direct', permission: { feature: 'Attendance', action: 'view' } },
  '/reports': { route: '/reports', type: 'direct', permission: { feature: 'Reports', action: 'view' } },
  '/skill-management/dashboard': { route: '/skill-management/dashboard', type: 'direct', permission: { feature: 'Skills Dashboard', action: 'view' } },
  '/policies': { route: '/policies', type: 'direct', permission: { feature: 'Policies', action: 'view' } },
  '/events': { route: '/events', type: 'direct', permission: { feature: 'Events', action: 'view' } },
  '/claimsandexpenses': { route: '/claimsandexpenses', type: 'direct', permission: { feature: 'Expenses', action: 'view' } },
  '/organization-chart': { route: '/organization-chart', type: 'direct', permission: { feature: 'Org Hierarchy', action: 'view' } },
  '/theme': { route: '/theme', type: 'direct', permission: { feature: 'Themes', action: 'view' } },
  '/blood-bank': { route: '/blood-bank', type: 'direct', permission: { feature: 'Blood Bank', action: 'view' } },
  '/contacts-directory': { route: '/contacts-directory', type: 'direct', permission: { feature: 'Contacts Directory', action: 'view' } },
  '/phonebook': { route: '/phonebook', type: 'direct', permission: { feature: 'Phone Book', action: 'view' } },
  '/assets-management': { route: '/assets-management', type: 'direct', permission: { feature: 'Asset Management', action: 'view' } },
  '/card-management': { route: '/card-management', type: 'direct', permission: { feature: 'Cards Management', action: 'view' } },
  '/desk': { route: '/desk', type: 'direct', permission: { feature: 'Desk Allocation', action: 'view' } },
  '/calendar-view': { route: '/calendar-view', type: 'direct', permission: { feature: 'Calendar', action: 'view' } },
  '/time-off': {
    route: '/time-off',
    type: 'dropdown',
    permission: { feature: 'Time-Off', action: 'view' },
    children: [
      '/time-off/leaves/waiting-for-approval',
      '/time-off/wfh/waiting-for-approval',
      '/time-off/remote/waiting-for-approval',
      '/time-off/comp-off/waiting-for-approval',
      '/time-off/premissions/waiting-for-approval',
      '/time-off/regularization/waiting-for-approval',
      '/time-off/extra-hours/waiting-for-approval'
    ]
  },
  '/pending-approvals': {
    route: '/pending-approvals',
    type: 'dropdown',
    permission: { feature: 'Pending Approvals Module', action: 'view' },
    children: [
      '/pending-approvals/time-off',
      '/pending-approvals/on-boarding',
      '/pending-approvals/contractors',
      '/pending-approvals/off-boarding',
      '/pending-approvals/desk-approval',
      '/pending-approvals/claimsandexpenses-request',
      '/pending-approvals/time-sheets',
      '/pending-approvals/employeeinfo-request',
      '/pending-approvals/kra-kpi'
    ]
  },
  '/project-management': {
    route: '/project-management',
    type: 'dropdown',
    permission: { feature: 'Project Management', action: 'view' },
    children: [
      '/project-management/clients',
      '/project-management/projects',
      '/project-management/timesheet'
    ]
  },
  '/on-behalf-of': {
    route: '/on-behalf-of',
    type: 'dropdown',
    permission: { feature: 'On Behalf Of', action: 'view' },
    children: [
      '/on-behalf-of/on-behalf-of',
      '/on-behalf-of/on-behalf-of-wfh',
      '/on-behalf-of/on-behalf-of-remotelogin',
      '/on-behalf-of/global/permissions',
      '/on-behalf-of/on-behalf-of-approvals',
      '/on-behalf-of/on-behalf-of-expenses'
    ]
  },
  '/pms': {
    route: '/pms',
    type: 'dropdown',
    permission: { feature: 'PMS', action: 'view' },
    children: [
      '/pms/review-cycle',
      '/pms/performace-review/myPerformance/pending-review',
      '/pms/kra',
      '/pms/kpi',
      '/pms/assign-kra-kpi',
      '/pms/kpi-kra'
    ]
  }
};

export const QUICK_LINK_DEFAULT_ROUTES: string[] = [
  '/myinfo/personal/basic-info',
  '/holidays/public-holidays',
  '/time-off/leaves/waiting-for-approval',
  '/time-off/premissions/waiting-for-approval',
  '/policies/companypolicies',
  '/calendar-view',
  '/project-management/timesheet',
  '/claimsandexpenses/expenses',
  '/theme/selection'
];

export function resolveQuickLinkRouteDef(route: string): QuickLinkRouteDef | null {
  return QUICK_LINK_ROUTES[route] ?? null;
}

export function resolveQuickLinksFromSourceRoute(sourceRoute: string, context?: QuickLinksResolveContext): string[] {
  const source = QUICK_LINK_SOURCES[sourceRoute];
  if (!source) return [];
  if (source.type === 'direct') return [];

  const resolved = source.children ?? [];
  if (sourceRoute !== '/time-off') return resolved;

  const allowWFH = !!context?.allowWFH;
  const allowRemoteLogin = !!context?.allowRemoteLogin;

  return resolved.filter((route) => {
    if (route === '/time-off/wfh/waiting-for-approval') return allowWFH;
    if (route === '/time-off/remote/waiting-for-approval') return allowRemoteLogin;
    return true;
  });
}

export function resolveQuickLinksSourceDef(route: string): QuickLinksSourceDef | null {
  return QUICK_LINK_SOURCES[route] ?? null;
}
