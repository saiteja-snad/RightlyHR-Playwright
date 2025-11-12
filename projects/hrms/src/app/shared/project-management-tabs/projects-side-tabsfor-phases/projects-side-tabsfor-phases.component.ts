import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects-side-tabsfor-phases',
  imports: [CommonModule, RouterModule],
  templateUrl: './projects-side-tabsfor-phases.component.html',
  styleUrl: './projects-side-tabsfor-phases.component.scss'
})
export class ProjectsSideTabsforPhasesComponent {
  filteredTabs: any[] = [];
  statusCounts: any = {};
  projectId: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    {
      label: 'Active', link: '/project-management/projects/details/phases', icon: 'project-mangement-icons/activePhases.png', statusKey: 'active',
      permission: { feature: 'Project Phases Tab', action: 'view' }
    },
    {
      label: 'Inactive', link: '/project-management/projects/details/inactive-phases', icon: 'project-mangement-icons/inactivePhases.png', statusKey: 'inactive',
      permission: { feature: 'Project Phases Tab', action: 'view' },
    },
    {
      label: 'On Hold', link: '/project-management/projects/details/hold-phases', icon: 'project-mangement-icons/holdPhases.png', statusKey: 'hold',
      permission: { feature: 'Project Phases Tab', action: 'view' },
    },


  ];

  constructor(public rbac: RbacService, private http: HttpService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.filterTabsByRbac();
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        this.getcountData(this.projectId)

      }
    });
    this.http.projectcountfuntionphases$.subscribe(() => {
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
    active: ['yet to start', 'in progress', 'extended'],
    inactive: ['completed', 'close'],
    hold: ['hold']
  };

getcountData(projectId: any): void {
  const statuses = 'yet to start,in progress,extended,hold,completed,close';

  this.http.getData(`StatusCount?moduleName=Phase&entityId=${projectId}&statuses=${statuses}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
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
        console.error('Error fetching phase status count', err);
      }
    });
}


  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
