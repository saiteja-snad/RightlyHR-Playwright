import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-client-resource-tab',
  imports: [TabsModule, RouterModule, CommonModule],
  templateUrl: './client-resource-tab.component.html',
  styleUrl: './client-resource-tab.component.scss'
})

export class ClientResourceTabComponent {
  filteredTabs: any[] = [];
  statusCounts: any = {};
  projectId: any;
  loading = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    {
      label: 'Active', link: '/project-management/clients/details/resources', icon: '/my-info-icons/contact-icon.png', statusKey: 'active',
      permission: { feature: 'Client Resources', action: 'view' }
    },
    {
      label: 'Waiting For Approval', link: '/project-management/clients/details/waiting-for-approval-resources', icon: '/time-off-icon/waiting-for-approval-resource.png', statusKey: 'waitingforapproval',
      permission: { feature: 'Client Resources', action: 'view' },
    },
    {
      label: 'Inactive', link: '/project-management/clients/details/inactive-resources', icon: 'main-menu-icons/project-management-project.png', statusKey: 'inactive',
      permission: { feature: 'Client Resources', action: 'view' },
    },
  ];

  constructor(public rbac: RbacService, private router: Router, private http: HttpService, private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        this.getcountData(this.projectId)
      }
    });
    this.filterTabsByRbac();
    this.http.projectcountresource$.subscribe(() => {
      this.getcountData(this.projectId);
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

  statusGroups: any = {
    active: ['assigned', 'active'],
    inactive: ['released'],
    waitingforapproval: ['waitingforapproval']
  };

  getcountData(projectId: any): void {
    this.loading = true
    const statuses = 'assigned,released,active';

    this.http.getData(`StatusCount?moduleName=Resource&clientId=${projectId}&statuses=${statuses}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.statusCounts = {};
        const rawCounts: any = {};
        // Step 1: Store all raw counts from API
        res?.data?.forEach((item: any) => {
          rawCounts[item.status.toLowerCase()] = item.count || 0;
        });
        // Step 2: Aggregate based on groups
        Object.keys(this.statusGroups).forEach(groupKey => {
          const statuses = this.statusGroups[groupKey];
          let total = 0;
          statuses.forEach((status: string | number) => {
            total += rawCounts[status] || 0; // Add 0 if missing
          });
          this.statusCounts[groupKey] = total;
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching phase status count', err);
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}