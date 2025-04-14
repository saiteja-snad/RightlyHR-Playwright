import { Component } from '@angular/core';
import { Router, RouterModule,  } from '@angular/router';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { SettingsPersonalTabsComponent } from "../../../shared/settings-tabs/settings-personal-tabs/settings-personal-tabs.component";
import { CommonModule } from '@angular/common';
import { SettingsTimeOffTabsComponent } from "../../../shared/settings-tabs/settings-time-off-tabs/settings-time-off-tabs.component";

@Component({
  selector: 'app-time-off-layout',
  imports: [RouterModule, CommonModule, SettingsTimeOffTabsComponent],
  templateUrl: './time-off-layout.component.html',
  styleUrl: './time-off-layout.component.scss'
})
export class TimeOffLayoutComponent {
  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}
