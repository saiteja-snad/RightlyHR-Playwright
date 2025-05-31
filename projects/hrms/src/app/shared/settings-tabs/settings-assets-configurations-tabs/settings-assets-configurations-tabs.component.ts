import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-settings-assets-configurations-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './settings-assets-configurations-tabs.component.html',
  styleUrl: './settings-assets-configurations-tabs.component.scss'
})

export class SettingsAssetsConfigurationsTabsComponent {
  public navTabs: any[] = [];

  constructor(public rbac: RbacService) {
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  allTabs = [
    {
      label: 'Vendor Details',
      link: '/settings/assets-configuration/vendor-detiles',
      permission: { feature: 'Vendor Details', action: 'view' },
      icon: '/settings-icon/vendor-details-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_VENDOR_DETAILS,
    },
    {
      label: 'Asset Category',
      link: '/settings/assets-configuration/asset-catagory',
      permission: { feature: 'Asset Catagory', action: 'view' },
      icon: '/images/assets-list.png',
      subjectText: MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_ASSET_CATEGORY,
    },
    {
      label: 'Asset Sub Category',
      link: '/settings/assets-configuration/asset-subcatagory',
      permission: { feature: 'Asset Sub Catagory', action: 'view' },
      icon: '/settings-icon/leave-category-icon.png',
      subjectText: MODULE_INFOS.SETTINGS_ASSET_CONFIGURATION_ASSET_SUB_CATEGORY,
    }
  ];
}