import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";

@Component({
  selector: 'app-employee-fields-layout',
  imports: [CommonModule, RouterModule, SettingsEmployeeFieldsModuleTabsComponent],
  templateUrl: './employee-fields-layout.component.html',
  styleUrl: './employee-fields-layout.component.scss'
})

export class EmployeeFieldsLayoutComponent {
  constructor(public readonly router: Router) {

  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}