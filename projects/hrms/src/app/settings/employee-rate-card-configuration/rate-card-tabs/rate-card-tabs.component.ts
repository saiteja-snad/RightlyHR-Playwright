import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { RbacService } from '../../../services/rbac.service';
import { HttpService } from '../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rate-card-tabs',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './rate-card-tabs.component.html',
  styleUrl: './rate-card-tabs.component.scss'
})
export class RateCardTabsComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  statusCounts: any = {};
  filteredTabs: any[] = [];
  navTabs: any[] = [
    {
      label: 'Active',
      icon: '/settings-icon/Active.png',
      route:
        '/settings/employee-rate-card/rate-card/rate-card-active',
      permission: { feature: 'Rate Card Active Tab', action: 'view' },
      statusKey: 'active'
    },
    {
      label: 'Inactive',
      icon: '/settings-icon/Inactive.png',
      route:
        '/settings/employee-rate-card/rate-card/rate-card-inactive',
      permission: { feature: 'Rate Card In-active Tab', action: 'view' },
      statusKey: 'inactive'
    },
  ];

  constructor(private rbac: RbacService, private router: Router, private accessNav: AccessNavigationService,private http:HttpService) { }


  ngOnInit(): void {
    this.getcountData();
    this.filterTabsByRbac();
    this.http.ratecardcountfuntion$.subscribe(() => {
      this.getcountData();
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
getcountData(): void {
    this.http.getData(`RateCard/status-count`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.statusCounts = res.data;
      },
      error: (err) => { }
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
