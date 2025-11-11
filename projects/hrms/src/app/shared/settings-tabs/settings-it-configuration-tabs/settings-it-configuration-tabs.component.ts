import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { MODULE_INFOS } from '../../modules-info';

@Component({
  selector: 'app-settings-it-configuration-tabs',
  standalone: true,
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './settings-it-configuration-tabs.component.html',
  styleUrl: './settings-it-configuration-tabs.component.scss',
   encapsulation: ViewEncapsulation.None
})
export class SettingsItConfigurationTabsComponent implements OnInit {

   filteredTabs: any[] = [];

  allNavLinks = [
   {label: 'IT Support Category',route: '/settings/it-configuration/itsupport-category',permission: { feature: 'IT Support Category', action: 'view' }},
    {label: 'IT Support Sub Category',route: '/settings/it-configuration/itsupport-sub-category',permission: { feature: 'IT Support Sub-Category', action: 'view' }},


  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.allNavLinks.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }


}
