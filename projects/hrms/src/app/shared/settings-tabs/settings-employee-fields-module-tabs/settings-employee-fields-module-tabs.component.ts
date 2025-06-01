import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-settings-employee-fields-module-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-employee-fields-module-tabs.component.html',
  styleUrl: './settings-employee-fields-module-tabs.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsEmployeeFieldsModuleTabsComponent implements OnInit {
  navTabs: any[] = [];
  allTabs: any[] = [
    {
      label: 'Personal',
      link: '/settings/employee-fields/personal',
      icon: '/settings-icon/personal-icon.png',
      permission: { feature: 'Personal Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_PERSONAL_INFO_MODULE_INFO,
    },
    {
      label: 'Job',
      link: '/settings/employee-fields/job',
      icon: '/images/jobdetailes.png',
      permission: { feature: 'Job Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_JOB_INFO_MODULE_INFO,
    },
    {
      label: 'Document',
      link: '/settings/employee-fields/documents',
      icon: '/main-menu-icons/generate-documents.png',
      permission: { feature: 'Document Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_DOCUMENTS_INFO_MODULE_INFO,
    },
    {
      label: 'Manage Shifts',
      link: '/settings/employee-fields/manage-shifts',
      icon: '/settings-icon/manage-shifts-icon.png',
      permission: { feature: 'Manage Shifts Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_MANAGE_SHIFTS_INFO_MODULE_INFO,
    },
    {
      label: 'Manage Policies',
      link: '/settings/employee-fields/manage-policies',
      icon: '/settings-icon/manage-policies.png',
      permission: { feature: 'Manage Policies Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_MANAGE_POLICIES_INFO_MODULE_INFO,
    },
    {
      label: 'Manage Holidays',
      link: '/settings/employee-fields/manage-holidays',
      icon: '/main-menu-icons/holiday-icon.png',
      permission: { feature: 'Manage Holidays Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_MANAGE_HOLIDAYS_INFO_MODULE_INFO,
    },
    {
      label: 'Manage Weekends',
      link: '/settings/employee-fields/manage-weekends',
      icon: '/settings-icon/manage-weekend-icon.png',
      permission: { feature: 'Manage Weekends Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_MANAGE_WEEKENDS_INFO_MODULE_INFO,
    },
    {
      label: 'Expense Configurations',
      link: '/settings/employee-fields/expenes',
      icon: '/main-menu-icons/expenses-icon.png',
      permission: { feature: 'Expense Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_ESPENSE_TYPE_INFO_MODULE_INFO,
    },
    {
      label: 'Manage DST',
      link: '/settings/employee-fields/manage-dsts',
      icon: '/settings-icon/manage-dst-icon.png',
      permission: { feature: 'Manage DST Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_MANAGE_DST_INFO_MODULE_INFO,
    },
    {
      label: 'No Due Clearance',
      link: '/settings/employee-fields/no-due-clearnce',
      icon: '/time-off-icon/No-due-icon.png',
      permission: { feature: 'NoDue Clearance Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_NO_DUE_CLEARANCE_MODULE_INFO,
    }
  ];

  constructor(
    public rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.navTabs = this.allTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
}