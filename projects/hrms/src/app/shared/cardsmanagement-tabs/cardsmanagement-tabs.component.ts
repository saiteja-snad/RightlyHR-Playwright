import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SidetabsloadersComponent } from "../../shared/sidetabsloaders/sidetabsloaders.component";
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
@Component({
  selector: 'app-cardsmanagement-tabs',
  imports: [CommonModule, RouterModule, TabsModule, TranslateModule, SidetabsloadersComponent],
  templateUrl: './cardsmanagement-tabs.component.html',
  styleUrl: './cardsmanagement-tabs.component.scss',
})

export class CardsmanagementTabsComponent implements OnInit {
  loading = false;
  filteredTabs: any[] = [];
  navTabs: any[] = [
    { key: 'available',
      label: 'Available', link: '/card-management/details', icon: '/cards-icons/Available.png',
      permission: { feature: 'Cards Available', action: 'view' },count:0
    },
    { key: 'allocated',
      label: 'Allocated', link: '/card-management/allocated', icon: '/cards-icons/Allocated.png',
      permission: { feature: 'Cards Allocated', action: 'view',count:0 }
    },
    { key: 'expired',
      label: 'Expired', link: '/card-management/expiry', icon: '/cards-icons/Expired.png',
      permission: { feature: 'Cards Expired', action: 'view',count:0 }
    },
    { key: 'hold',
      label: 'On Hold', link: '/card-management/hold', icon: '/cards-icons/Hold.png',
      permission: { feature: 'Cards Hold', action: 'view',count:0 }
    },
  ];

  constructor(public rbac: RbacService,public http: HttpService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
    this.http.counts$.subscribe((counts) => {
      if (counts) {
        this.navTabs.forEach(tab => {
          tab.count = counts[tab.key] ?? 0;
        });
        this.cdr.markForCheck(); // if OnPush
        console.log('Mapped tab counts:', this.navTabs);
      }
    });
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