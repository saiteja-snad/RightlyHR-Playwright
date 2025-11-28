import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { RbacService } from '../../services/rbac.service';
import { MODULE_INFOS } from '../modules-info';

@Component({
  selector: 'app-settings-employee-fields-update-configurations',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-employee-fields-update-configurations.component.html',
  styleUrl: './settings-employee-fields-update-configurations.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class SettingsEmployeeFieldsUpdateConfigurationsComponent implements OnInit {
  navTabs: any[] = [];
  allTabs: any[] = [
    {
      label: 'Personal Information Update',
      link: '/settings/employee-fields-update-configurations/personal',
      icon: '/settings-icon/personal-icon.png',
      permission: { feature: 'Personal Config Update Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_PERSONAL_INFORMATION_UPDATE_MODULE_INFO,
    },
    {
      label: 'Job Information Update',
      link: '/settings/employee-fields-update-configurations/job',
      icon: '/images/jobdetailes.png',
      permission: { feature: 'Job Config Update Tab', action: 'view' },
      subjectText: MODULE_INFOS.SETTINGS_JOB_INFORMATION_UPDATE_MODULE_INFO,
    },
    // {
    //   label: 'Document Information Update',
    //   link: '/settings/employee-fields-update-configurations/documents',
    //   icon: '/main-menu-icons/generate-documents.png',
    //   permission: { feature: 'Document Config Update Tab', action: 'view' },
    //   subjectText: MODULE_INFOS.SETTINGS_DOCUMENTS_INFO_MODULE_INFO,
    // }
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
