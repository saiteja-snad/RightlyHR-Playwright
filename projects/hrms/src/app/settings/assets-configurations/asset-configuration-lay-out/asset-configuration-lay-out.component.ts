import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";

@Component({
  selector: 'app-asset-configuration-lay-out',
  imports: [RouterModule, NgbPopoverModule, SettingsHeaderComponent],
  templateUrl: './asset-configuration-lay-out.component.html',
  styleUrl: './asset-configuration-lay-out.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class AssetConfigurationLayOutComponent implements OnInit {
  moduleinfo: string = '';
  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/assets-configuration/vendor-detiles': MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_MODULE_INFO,
      '/settings/assets-configuration/asset-catagory': MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_MODULE_INFO,
      '/settings/assets-configuration/asset-subcatagory': MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
}