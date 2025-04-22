import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SettingsAssetsConfigurationsTabsComponent } from "../../../shared/settings-tabs/settings-assets-configurations-tabs/settings-assets-configurations-tabs.component";

@Component({
  selector: 'app-asset-configuration-lay-out',
  imports: [RouterModule, SettingsAssetsConfigurationsTabsComponent],
  templateUrl: './asset-configuration-lay-out.component.html',
  styleUrl: './asset-configuration-lay-out.component.scss'
})
export class AssetConfigurationLayOutComponent {

  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); 
  }
}

