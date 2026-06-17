import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SidetabsloadersComponent } from "../../shared/sidetabsloaders/sidetabsloaders.component";
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../shared/tabs-dnd/tabs-dnd.directive';

interface StatusTab {
  tabId: string;
  key: string;
  label: string;
  link: string;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-cardsmanagement-tabs',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule, SidetabsloadersComponent, DragDropModule, TabsDndDirective],
  templateUrl: './cardsmanagement-tabs.component.html',
  styleUrl: './cardsmanagement-tabs.component.scss',
})

export class CardsmanagementTabsComponent implements OnInit {
  readonly tabsKey = 'cardsmanagement-tabs';
  loading = false;
  filteredTabs: StatusTab[] = [];
  navTabs: StatusTab[] = [
    {
      key: 'available',
      tabId: '/card-management/details',
      label: 'Available',
      link: '/card-management/details',
      icon: '/cards-icons/Available.png',
      permission: { feature: 'Cards Available', action: 'view' },
      count: 0
    },
    {
      key: 'allocated',
      tabId: '/card-management/allocated',
      label: 'Allocated',
      link: '/card-management/allocated',
      icon: '/cards-icons/Allocated.png',
      permission: { feature: 'Cards Allocated', action: 'view' },
      count: 0
    },
    {
      key: 'expired',
      tabId: '/card-management/expiry',
      label: 'Expired',
      link: '/card-management/expiry',
      icon: '/cards-icons/Expired.png',
      permission: { feature: 'Cards Expired', action: 'view' },
      count: 0
    },
    {
      key: 'hold',
      tabId: '/card-management/hold',
      label: 'On Hold',
      link: '/card-management/hold',
      icon: '/cards-icons/Hold.png',
      permission: { feature: 'Cards Hold', action: 'view' },
      count: 0
    },
  ];

  constructor(public rbac: RbacService,public http: HttpService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
    this.http.counts$.subscribe((counts) => {
      if (counts) {
        const map = new Map<string, number>();
        Object.keys(counts).forEach(key => map.set(key, counts[key] ?? 0));
        this.navTabs = this.navTabs.map(tab => ({ ...tab, count: map.get(tab.key) ?? 0 }));
        this.filterTabsByRbac();
        this.cdr.markForCheck();
      }
    });
  }

  trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}
