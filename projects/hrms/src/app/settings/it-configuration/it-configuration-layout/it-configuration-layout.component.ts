import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
import { MODULE_INFOS } from '../../../shared/modules-info';
import { filter } from 'rxjs';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsItConfigurationTabsComponent } from '../../../shared/settings-tabs/settings-it-configuration-tabs/settings-it-configuration-tabs.component';



@Component({
  selector: 'app-it-configuration-layout',
  imports: [CommonModule, RouterModule, SettingsItConfigurationTabsComponent, SettingsHeaderComponent],
  templateUrl: './it-configuration-layout.component.html',
  styleUrl: './it-configuration-layout.component.scss'
})
export class ItConfigurationLayoutComponent implements OnInit {
   moduleinfo : string = '';
  constructor(public readonly router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  shouldShowSection(): boolean {
    const cloningPolicyId = localStorage.getItem('cloningPolicyId');
    const excludedRoutes: (string | RegExp)[] = [
      '/settings/employee-fields/addholidays',
      '/settings/employee-fields/updateholidays',
      '/settings/employee-fields/viewholidays',
      '/settings/employee-fields/cloneholidays',
      '/settings/employee-fields/addshifts',
      /^\/settings\/employee-fields\/updateshifts\/\d+$/,
      /^\/settings\/employee-fields\/cloneshifts\/\d+$/,
      /^\/settings\/employee-fields\/viewshifts\/\d+$/,
      '/settings/employee-fields/addpolices',
      '/settings/employee-fields/updatepolices',
      '/settings/employee-fields/viewpolices',
      '/settings/employee-fields/add-weekends',
      '/settings/employee-fields/update-weekends',
      '/settings/employee-fields/clone-weekends',
      '/settings/employee-fields/view-weekends',
      '/settings/employee-fields/add-dst',
      '/settings/employee-fields/update-dst',
      '/settings/employee-fields/clone-dst',
      '/settings/employee-fields/view-dst',
      '/settings/employee-fields/updateholidays',
      '/settings/employee-fields/viewholidays',
      '/settings/employee-fields/updatepolices',
      `/settings/employee-fields/clonepolices`,
      '/settings/employee-fields/viewpolices',
      '/settings/employee-fields/documents',
    ];
    return !excludedRoutes.some((pattern) => {
      if (typeof pattern === 'string') {
        return pattern === this.router.url;
      } else if (pattern instanceof RegExp) {
        return pattern.test(this.router.url);
      }
      return false;
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/employee-fields/personal': MODULE_INFOS.SETTINGS_PERSONAL_INFO_MODULE_INFO,
      '/settings/employee-fields/job': MODULE_INFOS.SETTINGS_JOB_INFO_MODULE_INFO,
      '/settings/employee-fields/documents': MODULE_INFOS.SETTINGS_DOCUMENTS_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-shifts': MODULE_INFOS.SETTINGS_MANAGE_SHIFTS_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-policies': MODULE_INFOS.SETTINGS_MANAGE_POLICIES_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-holidays': MODULE_INFOS.SETTINGS_MANAGE_HOLIDAYS_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-weekends': MODULE_INFOS.SETTINGS_MANAGE_WEEKENDS_INFO_MODULE_INFO,
      '/settings/employee-fields/expenes': MODULE_INFOS.SETTINGS_ESPENSE_TYPE_INFO_MODULE_INFO,
      '/settings/employee-fields/manage-dsts': MODULE_INFOS.SETTINGS_MANAGE_DST_INFO_MODULE_INFO,
      '/settings/employee-fields/no-due-clearnce': MODULE_INFOS.SETTINGS_NO_DUE_CLEARANCE_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

}
