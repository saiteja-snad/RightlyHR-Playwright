import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-global-actions-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './global-actions-tabs.component.html',
  styleUrl: './global-actions-tabs.component.scss'
})

export class GlobalActionsTabsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedYear!: number;
  @Output() tabChanged = new EventEmitter<number>();
  
  subscription!: Subscription;
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Permissions', link: '/on-behalf-of/global/permissions', icon: '/time-off-icon/permissions-icon.png',
      permission: { feature: 'Global Permissions Module', action: 'view' },
      moduleId: environment.permissionsModuleId,
      count: 0
    },
    {
      label: 'WFH', link: '/on-behalf-of/global/wfh', icon: '/time-off-icon/WFH-icon.png',
      permission: { feature: 'Global Permissions Module', action: 'view' },
      moduleId: environment.wfhModuleId,
      count: 0
    },
  ];

  constructor(public rbac: RbacService, private http: HttpService) { }

  ngOnInit(): void {
    this.filterTabsByRbac();
    this.getTabCounts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedYear'] && !changes['selectedYear'].firstChange) {
      this.getTabCounts();
    }
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  getTabCounts(): void {
    this.filteredTabs.forEach(tab => {
      this.getCountByModuleId(tab.moduleId, tab);
    });
  }

  getCountByModuleId(moduleId: number, tab: any): void {
    const year = this.selectedYear || new Date().getFullYear();
    this.subscription = this.http.getData(`v2/GlobalPermissions/getGlobalPermissions?moduleId=${moduleId}&year=${year}`).subscribe({
      next: (response: any) => {
        tab.count = response.totalRecords || 0;
      },
      error: (err: any) => {
        console.log('Error fetching count for moduleId:', moduleId, err);
        tab.count = 0;
      }
    });
  }

  onTabClick(moduleId: number): void {
    this.tabChanged.emit(moduleId);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}