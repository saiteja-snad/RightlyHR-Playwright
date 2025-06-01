import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';
import { AccessNavigationService } from '../../../services/access-navigation.service';
@Component({
  selector: 'app-settings-assets-configurations-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './settings-assets-configurations-tabs.component.html',
  styleUrl: './settings-assets-configurations-tabs.component.scss'
})

export class SettingsAssetsConfigurationsTabsComponent {
  public navTabs: any[] = [];



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

  constructor(
    public rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService
  ) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.navTabs = this.allTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

}