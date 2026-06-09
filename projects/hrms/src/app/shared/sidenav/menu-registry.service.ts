import { Injectable } from '@angular/core';

export interface MenuItemDef {
  label: string;
  route: string;
  icon: string;
  activeIcon: string;
  personalizationIcon: string;
  /** White icon — used when item is in the Main Sidebar */
  sidebarIcon: string;
  /** Colored icon — used when item is in the Ellipses Menu */
  ellipsesIcon: string;
  permission: { feature: string; action: string };
  /** 'direct' = navigate on click, 'dropdown' = opens a sub-tabs flyout */
  type: 'direct' | 'dropdown';
  dropdownComponent?: string;
  /** Items that start in the main sidebar by default */
  defaultLocation: 'main' | 'ellipses';
}

@Injectable({ providedIn: 'root' })
export class MenuRegistryService {

  /** Single source of truth for every menu item in the application. */
  readonly ALL_ITEMS: MenuItemDef[] = [
    // ── Default MAIN items ──────────────────────────────────────────────────
    {
      label: 'My Info', route: '/myinfo', defaultLocation: 'main', type: 'direct',
      icon: '/main-menu-icons/my-Info-icon.png', activeIcon: '/main-menu-icons/my-Info-icon.png',
      personalizationIcon: '/personalization/My info.jpg',
      sidebarIcon: '/main-menu-icons/my-Info-icon.png',
      ellipsesIcon: '/personalization/Ellipses_My info.jpg',
      permission: { feature: 'My Info', action: 'view' }
    },
    {
      label: 'Employees', route: '/employee-management', defaultLocation: 'main', type: 'direct',
      icon: '/main-menu-icons/employee-management-icon.png', activeIcon: '/main-menu-icons/employee-management-icon.png',
      personalizationIcon: '/personalization/Employees.png',
      sidebarIcon: '/main-menu-icons/employee-management-icon.png',
      ellipsesIcon: '/personalization/Ellipses_Employees.png',
      permission: { feature: 'Employees', action: 'view' }
    },
    {
      label: 'Time Off', route: '/time-off', defaultLocation: 'main', type: 'dropdown', dropdownComponent: 'time-off',
      icon: '/main-menu-icons/clock.png', activeIcon: '/main-menu-icons/clock.png',
      personalizationIcon: '/personalization/Time Off.png',
      sidebarIcon: '/main-menu-icons/clock.png',
      ellipsesIcon: '/personalization/Ellipses_Time Off.png',
      permission: { feature: 'Time-Off', action: 'view' }
    },
    {
      label: 'Attendance', route: '/attendance', defaultLocation: 'main', type: 'direct',
      icon: '/main-menu-icons/finger-print.png', activeIcon: '/main-menu-icons/finger-print.png',
      personalizationIcon: '/personalization/Attendance.png',
      sidebarIcon: '/main-menu-icons/finger-print.png',
      ellipsesIcon: '/personalization/Ellipses_Attendance.png',
      permission: { feature: 'Attendance', action: 'view' }
    },
    {
      label: 'Reports', route: '/reports', defaultLocation: 'main', type: 'direct',
      icon: '/main-menu-icons/reports.png', activeIcon: '/main-menu-icons/reports.png',
      personalizationIcon: '/personalization/Reports.png',
      sidebarIcon: '/main-menu-icons/reports.png',
      ellipsesIcon: '/personalization/Ellipses_Reports.png',
      permission: { feature: 'Reports', action: 'view' }
    },
    {
      label: 'Project Management', route: '/project-management', defaultLocation: 'main', type: 'dropdown', dropdownComponent: 'project-management',
      icon: '/main-menu-icons/project-management-icon.png', activeIcon: '/main-menu-icons/project-management-icon.png',
      personalizationIcon: '/personalization/Project Management.png',
      sidebarIcon: '/main-menu-icons/project-management-icon.png',
      ellipsesIcon: '/personalization/Ellipses_Project Management.png',
      permission: { feature: 'Project Management', action: 'view' }
    },
    {
      label: 'Skill Set', route: '/skill-management', defaultLocation: 'main', type: 'direct',
      icon: '/main-menu-icons/skill-management.png', activeIcon: '/main-menu-icons/skill-management.png',
      personalizationIcon: '/personalization/Skill Set.png',
      sidebarIcon: '/main-menu-icons/skill-management.png',
      ellipsesIcon: '/personalization/Ellipses_Skill Set.png',
      permission: { feature: 'Skill Set Management', action: 'view' }
    },
    {
      label: 'On Behalf Of', route: '/on-behalf-of', defaultLocation: 'main', type: 'dropdown', dropdownComponent: 'on-behalf-of',
      icon: '/main-menu-icons/on-behalf-of.png', activeIcon: '/main-menu-icons/on-behalf-of.png',
      personalizationIcon: '/personalization/On Behalf Of.png',
      sidebarIcon: '/main-menu-icons/on-behalf-of.png',
      ellipsesIcon: '/personalization/Ellipses_On Behalf Of.png',
      permission: { feature: 'On Behalf Of', action: 'view' }
    },
    {
      label: 'Pending Approvals', route: '/pending-approvals', defaultLocation: 'main', type: 'dropdown', dropdownComponent: 'pending-approvals',
      icon: '/main-menu-icons/pending-approvals.png', activeIcon: '/main-menu-icons/pending-approvals.png',
      personalizationIcon: '/personalization/Pending Approvals.png',
      sidebarIcon: '/main-menu-icons/pending-approvals.png',
      ellipsesIcon: '/personalization/Ellipses_Pending Approvals.png',
      permission: { feature: 'Pending Approvals Module', action: 'view' }
    },
    {
      label: 'PMS', route: '/pms', defaultLocation: 'main', type: 'dropdown', dropdownComponent: 'pms',
      icon: '/main-menu-icons/pms.png', activeIcon: '/main-menu-icons/pms.png',
      personalizationIcon: '/personalization/PMS.png',
      sidebarIcon: '/main-menu-icons/pms.png',
      ellipsesIcon: '/personalization/Ellipses_PMS.png',
      permission: { feature: 'PMS', action: 'view' }
    },
    // ── Default ELLIPSES items ───────────────────────────────────────────────
    {
      label: 'Holidays', route: '/holidays', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/holiday-icon.png', activeIcon: '/main-menu-icons/holidays.png',
      personalizationIcon: '/main-menu-icons/holiday-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Holidays.png',
      ellipsesIcon: '/main-menu-icons/holiday-icon.png',
      permission: { feature: 'Holidays', action: 'view' }
    },
    {
      label: 'Policies', route: '/policies', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/policies-icon.png', activeIcon: '/main-menu-icons/policies.png',
      personalizationIcon: '/main-menu-icons/policies-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Policies.png',
      ellipsesIcon: '/main-menu-icons/policies-icon.png',
      permission: { feature: 'Policies', action: 'view' }
    },
    {
      label: 'Events', route: '/events', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/events-colored-icon.png', activeIcon: '/main-menu-icons/calendar-favorite.png',
      personalizationIcon: '/main-menu-icons/events-colored-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Events.png',
      ellipsesIcon: '/main-menu-icons/events-colored-icon.png',
      permission: { feature: 'Events', action: 'view' }
    },
    {
      label: 'Expenses', route: '/claimsandexpenses', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/expenses-icon.png', activeIcon: '/main-menu-icons/expenses.png',
      personalizationIcon: '/main-menu-icons/expenses-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Expenses.png',
      ellipsesIcon: '/main-menu-icons/expenses-icon.png',
      permission: { feature: 'Expenses', action: 'view' }
    },
    {
      label: 'Org Hierarchy', route: '/organization-chart', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/org.png', activeIcon: '/main-menu-icons/org-hierarchy-square.png',
      personalizationIcon: '/main-menu-icons/org.png',
      sidebarIcon: '/personalization/Mainmenu_Org Hierarchy.png',
      ellipsesIcon: '/main-menu-icons/org.png',
      permission: { feature: 'Org Hierarchy', action: 'view' }
    },
    {
      label: 'Personalization', route: '/theme', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/themes-color-icon.png', activeIcon: '/main-menu-icons/themes-icon.png',
      personalizationIcon: '/main-menu-icons/themes-color-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Personalization.png',
      ellipsesIcon: '/main-menu-icons/themes-color-icon.png',
      permission: { feature: 'Themes', action: 'view' }
    },
    {
      label: 'Blood Bank', route: '/blood-bank', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/blood-bank-color-icon.png', activeIcon: '/main-menu-icons/blood-bank-icon.png',
      personalizationIcon: '/main-menu-icons/blood-bank-color-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Blood Bank.png',
      ellipsesIcon: '/main-menu-icons/blood-bank-color-icon.png',
      permission: { feature: 'Blood Bank', action: 'view' }
    },
    {
      label: 'Contacts Directory', route: '/contacts-directory', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/contact-directory-color-icon.png', activeIcon: '/main-menu-icons/contact-directory-icon.png',
      personalizationIcon: '/main-menu-icons/contact-directory-color-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Contacts Directory.png',
      ellipsesIcon: '/main-menu-icons/contact-directory-color-icon.png',
      permission: { feature: 'Contacts Directory', action: 'view' }
    },
    {
      label: 'Phone Book', route: '/phonebook', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/phonebook-color-icon.png', activeIcon: '/main-menu-icons/phonebook-icon.png',
      personalizationIcon: '/main-menu-icons/phonebook-color-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Phone Book.png',
      ellipsesIcon: '/main-menu-icons/phonebook-color-icon.png',
      permission: { feature: 'Phone Book', action: 'view' }
    },
    {
      label: 'Assets', route: '/assets-management', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/assets-icon.png', activeIcon: '/main-menu-icons/assets.png',
      personalizationIcon: '/main-menu-icons/assets-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Assets.png',
      ellipsesIcon: '/main-menu-icons/assets-icon.png',
      permission: { feature: 'Asset Management', action: 'view' }
    },
    {
      label: 'Cards Management', route: '/card-management', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/card-management-icon.png', activeIcon: '/main-menu-icons/card-management-active.png',
      personalizationIcon: '/main-menu-icons/card-management-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Cards Management.png',
      ellipsesIcon: '/main-menu-icons/card-management-icon.png',
      permission: { feature: 'Cards Management', action: 'view' }
    },
    {
      label: 'Desk Allocation', route: '/desk', defaultLocation: 'ellipses', type: 'direct',
      icon: '/main-menu-icons/desk-icon.png', activeIcon: '/main-menu-icons/computer-desk.png',
      personalizationIcon: '/main-menu-icons/desk-icon.png',
      sidebarIcon: '/personalization/Mainmenu_Desk.png',
      ellipsesIcon: '/main-menu-icons/desk-icon.png',
      permission: { feature: 'Desk Allocation', action: 'view' }
    },
  ];

  getByRoute(route: string): MenuItemDef | undefined {
    return this.ALL_ITEMS.find(i => i.route === route);
  }

  /**
   * Given a saved MenuOrder and the set of allowed routes (RBAC-filtered),
   * returns { main, ellipses } with strict mutual exclusion — no item appears in both.
   */
  resolveMenus(
    savedMainRoutes: string[],
    savedEllipsesRoutes: string[],
    allowedRoutes: Set<string>
  ): { main: MenuItemDef[]; ellipses: MenuItemDef[] } {
    const allAllowed = this.ALL_ITEMS.filter(i => allowedRoutes.has(i.route));

    const main: MenuItemDef[] = [];
    const ellipses: MenuItemDef[] = [];
    const placed = new Set<string>();

    // 1. Place saved main routes first (skip dashboard, it's fixed)
    savedMainRoutes.filter(r => r !== '/dashboard').forEach(route => {
      const item = allAllowed.find(i => i.route === route);
      if (item && !placed.has(route)) { main.push(item); placed.add(route); }
    });

    // 2. Place saved ellipses routes
    savedEllipsesRoutes.forEach(route => {
      const item = allAllowed.find(i => i.route === route);
      if (item && !placed.has(route)) { ellipses.push(item); placed.add(route); }
    });

    // 3. Append any allowed items not yet placed, using their defaultLocation
    allAllowed.forEach(item => {
      if (!placed.has(item.route)) {
        if (item.defaultLocation === 'main') main.push(item);
        else ellipses.push(item);
        placed.add(item.route);
      }
    });

    return { main, ellipses };
  }
}
