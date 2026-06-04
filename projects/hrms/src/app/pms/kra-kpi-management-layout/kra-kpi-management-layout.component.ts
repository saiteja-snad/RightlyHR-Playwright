import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../services/rbac.service'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../shared/tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../services/theme-service/menu-order.service';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-kra-kpi-management-layout',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule, DragDropModule, TabsDndDirective],
  templateUrl: './kra-kpi-management-layout.component.html',
  styleUrl: './kra-kpi-management-layout.component.scss'
})

export class KraKpiManagementLayoutComponent {
  readonly tabsKey = 'krakpi-management-layout-tabs';
  tabs: StatusTab[] = [];
  navTabs: StatusTab[] = [
    {
      tabId: '/pms/kpi-kra/dashboard',
      label: 'Dashboard', link: '/pms/kpi-kra/dashboard', icon: 'main-menu-icons/kra-kpi-dashboard.png',
      permission: { feature: 'Dashboard KRA KPI', action: 'view' }
    },
    {
      tabId: '/pms/kpi-kra/my-kpi-kra',
      label: "My KRA/KPI's", link: '/pms/kpi-kra/my-kpi-kra', icon: 'main-menu-icons/my-kra-kpi.png',
      permission: { feature: 'My KRA KPI', action: 'view' }
    },
    {
      tabId: '/pms/kpi-kra/team',
      label: "Team KRA/KPI's", link: '/pms/kpi-kra/team', icon: 'main-menu-icons/team-kra-kpi.png',
      permission: { feature: 'Team KRA KPI', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private menuOrderService: MenuOrderService) { }

  ngOnInit(): void {
     this.rebuildTabs();
  }

  private rebuildTabs(): void {
    const filtered = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
    this.tabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      filtered,
      (t) => t.tabId
    );
  }

  trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }
}
