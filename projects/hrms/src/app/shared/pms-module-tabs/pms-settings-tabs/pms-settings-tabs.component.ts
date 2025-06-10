import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { MODULE_INFOS } from '../../modules-info';
@Component({
  selector: 'app-pms-settings-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './pms-settings-tabs.component.html',
  styleUrl: './pms-settings-tabs.component.scss'
})

export class PmsSettingsTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Increment Percentage',
      link: '/pmsconfiguration/increment',
      icon: '/main-menu-icons/Increment-percentage-icon.png',
      description: MODULE_INFOS.PMS_CONFIGURATION_INCREMENT_PERCENTAGE_MODULE_INFO,
      permission: { feature: 'Increment Percentage', action: 'view' }
    },
    {
      label: 'Assessor Configuration',
      link: '/pmsconfiguration/assessor',
      icon: '/main-menu-icons/sssessor-configuration.png',
      description: MODULE_INFOS.PMS_CONFIGURATION_ASSESSOR_CONFIGURATION_MODULE_INFO,
      permission: { feature: 'Assessor Configuration', action: 'view' }
    },
  ];

  constructor(private rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      const value = this.rbac.allowedToAccess(permissionString);
      return value;
    });
  }
}