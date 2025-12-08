import { Component } from '@angular/core';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from '../sidetabsloaders/sidetabsloaders.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-leave-entitlement-side-bar',
  imports: [RouterModule, CommonModule, TabsModule, SidetabsloadersComponent],
  templateUrl: './leave-entitlement-side-bar.component.html',
  styleUrl: './leave-entitlement-side-bar.component.scss'
})
export class LeaveEntitlementSideBarComponent {
 filteredTabs: any[] = [];
  statusCounts: any = {};
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    {
      label: 'Initial Load entitlements', link: '/settings/timeoff-configurations/loadentitlements/initial-load-entitlements', icon: 'project-mangement-icons/activeprojects.png', statusKey: 'active',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
    {
      label: 'Carry Forward Load entitlement', link: '/settings/timeoff-configurations/loadentitlements/carry-forward', icon: 'project-mangement-icons/Inactiveprojects.png', statusKey: 'inactive',
      permission: { feature: 'Project Details Tab', action: 'view' },
    },
 
  ];

  constructor(public rbac: RbacService, private http: HttpService, private router: Router) { }

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

}
