import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsAssetsConfigurationsTabsComponent } from "../../../shared/settings-tabs/settings-assets-configurations-tabs/settings-assets-configurations-tabs.component";
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../../shared/modules-info';
@Component({
  selector: 'app-asset-configuration-lay-out',
  imports: [RouterModule, SettingsAssetsConfigurationsTabsComponent, ModuleInformationComponent],
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