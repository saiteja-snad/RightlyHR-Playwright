import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-global-actions-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './global-actions-tabs.component.html',
  styleUrl: './global-actions-tabs.component.scss'
})

export class GlobalActionsTabsComponent {
  @Output() tabChanged = new EventEmitter<number>();
  
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Permissions', link: '/on-behalf-of/global/permissions', icon: '/time-off-icon/permissions-icon.png',
      permission: { feature: 'Global Permissions Module', action: 'view' },
      moduleId: environment.permissionsModuleId
    },
    {
      label: 'WFH', link: '/on-behalf-of/global/wfh', icon: '/time-off-icon/WFH-icon.png',
      permission: { feature: 'Global Permissions Module', action: 'view' },
      moduleId: environment.wfhModuleId
    },
  ];

  constructor(public rbac: RbacService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  onTabClick(moduleId: number): void {
    this.tabChanged.emit(moduleId);
  }
}