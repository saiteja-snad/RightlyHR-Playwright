import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-assets-configurations-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
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
    { label: 'Vendor Details',link: '/settings/assets-configuration/vendor-detiles',permission: { feature: 'Vendor Details', action: 'view' } },
    { label: 'Asset Category',link: '/settings/assets-configuration/asset-catagory',permission: { feature: 'Asset Catagory', action: 'view' } },
    { label: 'Asset Sub Category',link: '/settings/assets-configuration/asset-subcatagory',permission: { feature: 'Asset Sub Catagory', action: 'view' } }
  ];
}
