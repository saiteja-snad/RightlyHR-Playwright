import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-settings-assets-configurations-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './settings-assets-configurations-tabs.component.html',
  styleUrl: './settings-assets-configurations-tabs.component.scss'
})
export class SettingsAssetsConfigurationsTabsComponent {

    navTabs: any[] = [
      { label: 'Vendor Detailes', link: '/settings/assets-configuration/vendor-detiles' },
      { label: 'Asset Catagory', link: '/settings/assets-configuration/asset-catagory' },
      { label: 'Asset Sub Catagory', link: '/settings/assets-configuration/asset-subcatagory' },
    ,
    ];
}
