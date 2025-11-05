import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsAttendanceTabsComponent } from '../../../shared/settings-tabs/settings-attendance-tabs/settings-attendance-tabs.component';
import { SettingsHeaderComponent } from '../../../shared/settings-tabs/settings-header/settings-header.component';
import { CommonModule } from '@angular/common';
import { RbacService } from '../../../services/rbac.service';
import { SettingsLockingSystemTabsComponent } from '../../../shared/settings-tabs/settings-locking-system-tabs/settings-locking-system-tabs.component';
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { SettingsTimesheetLockingTabsComponent } from "../../../shared/settings-tabs/settings-timesheet-locking-tabs/settings-timesheet-locking-tabs.component";

@Component({
  selector: 'app-timesheet-lock-layout',
   imports: [RouterModule, SettingsLockingSystemTabsComponent, SettingsHeaderComponent, CommonModule, SettingsTimesheetLockingTabsComponent],
  templateUrl: './timesheet-lock-layout.component.html',
  styleUrl: './timesheet-lock-layout.component.scss'
})
export class TimesheetLockLayoutComponent {
  moduleinfo : string = '';
  
  constructor(public readonly router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events
    .pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    // const routeToInfoMap: { [key: string]: string } = {
    //   '/settings/timesheet-locking-configuration: MODULE_INFOS.SETTINGS_TIMESHEET_LOCKING_TABS,
    // }
    // const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    // this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

}
