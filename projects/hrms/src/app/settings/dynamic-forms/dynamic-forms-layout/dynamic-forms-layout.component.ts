import { Component } from '@angular/core';
import { SettingDynamicFormsTabsComponent } from "../../../shared/settings-tabs/setting-dynamic-forms-tabs/setting-dynamic-forms-tabs.component";
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-dynamic-forms-layout',
  imports: [SettingDynamicFormsTabsComponent,CommonModule, RouterModule,],
  templateUrl: './dynamic-forms-layout.component.html',
  styleUrl: './dynamic-forms-layout.component.scss'
})
export class DynamicFormsLayoutComponent {


  constructor(public readonly router: Router, public rbac: RbacService) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  navigateToCreateFormComponent() {
    this.router.navigate(['/settings/dynamic-forms/create-form']);
  }
}
