import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-client-side-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './client-side-tabs.component.html',
  styleUrl: './client-side-tabs.component.scss'
})
export class ClientSideTabsComponent {
   statusCounts:any = {};
    destroy$: Subject<boolean> = new Subject<boolean>();
  filteredTabs: any[] = [];
  navTabs: any[] = [

    {
      label: 'Active Clients', link: '/project-management/clients/active', icon: '/my-info-icons/contact-icon.png',statusKey: 'active',
      permission: { feature: 'Client Projects', action: 'view' }
    },
    {
      label: 'Inactive Clients', link: '/project-management/clients/inactive', icon: 'main-menu-icons/project-management-project.png',statusKey: 'inactive',
      permission: { feature: 'Client Projects', action: 'view' },
    },
    // {
    //   label: 'Hold Clients', link: '/project-management/clients/hold', icon: 'main-menu-icons/project-management-resources.png',statusKey: 'hold',
    //   permission: { feature: 'Client Resources', action: 'view' }
    // },

  ];

  constructor(public rbac: RbacService, private router: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.getcountData();
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

  
    getcountData(): void {
      this.http.getData(`StatusCount?moduleName=Client`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.statusCounts = {};
          res.data.forEach((item: any) => {
            this.statusCounts[item.status.toLowerCase()] = item.count || 0;
          })
        },
        error: (err) => {
  
        }
      });
    }


}
