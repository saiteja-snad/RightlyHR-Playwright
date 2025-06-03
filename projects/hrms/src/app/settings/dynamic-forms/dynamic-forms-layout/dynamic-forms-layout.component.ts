import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";

@Component({
  selector: 'app-dynamic-forms-layout',
  imports: [CommonModule, RouterModule, TranslateModule, NgbPopoverModule, SettingsHeaderComponent],
  templateUrl: './dynamic-forms-layout.component.html',
  styleUrl: './dynamic-forms-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class DynamicFormsLayoutComponent implements OnInit {
  moduleinfo: string = '';

  constructor(public readonly router: Router, public rbac: RbacService) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  navigateToCreateFormComponent() {
    this.router.navigate(['/settings/dynamic-forms/create-form']);
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/dynamic-forms/active-forms': MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_MODULE_INFO,
      '/settings/dynamic-forms/inactive-forms': MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_MODULE_INFO,
      '/settings/dynamic-forms/draft-forms': MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_MODULE_INFO,
      '/settings/dynamic-forms/form-settings': MODULE_INFOS.SETTINGS_DYNAMIC_FORMS_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}
