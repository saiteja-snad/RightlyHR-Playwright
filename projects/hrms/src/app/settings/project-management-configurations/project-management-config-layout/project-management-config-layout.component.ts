import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProjectManagementConfigTabsComponent } from "../project-management-config-tabs/project-management-config-tabs.component";
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";

@Component({
  selector: 'app-project-management-config-layout',
  imports: [RouterOutlet, ProjectManagementConfigTabsComponent, SettingsHeaderComponent],
  templateUrl: './project-management-config-layout.component.html',
  styleUrl: './project-management-config-layout.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class ProjectManagementConfigLayoutComponent {

}
