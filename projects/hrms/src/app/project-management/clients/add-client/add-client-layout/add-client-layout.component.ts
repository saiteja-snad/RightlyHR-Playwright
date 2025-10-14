import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProjectManagementModuleInfoComponent } from "../../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { ClientProgressBarComponent } from "../../../../shared/project-management-tabs/client-progress-bar/client-progress-bar.component";
import { BackIconComponent } from "../../../../icons/back-icon/back-icon.component";
@Component({
  selector: 'app-add-client-layout',
  imports: [CommonModule, RouterModule, ProjectManagementModuleInfoComponent, ClientProgressBarComponent, BackIconComponent],
  templateUrl: './add-client-layout.component.html',
  styleUrl: './add-client-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class AddClientLayoutComponent {
  constructor(public router: Router) { }
}