import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";

@Component({
  selector: 'app-project-resource-tab',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './project-resource-tab.component.html',
  styleUrl: './project-resource-tab.component.scss'
})
export class ProjectResourceTabComponent {
 filteredTabs: any[] = [];
  statusCounts: any = {};
  projectId: any;
  loading=false
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    {
      label: 'Active', link: '/project-management/projects/details/resources', icon: 'project-mangement-icons/activeresource.png', statusKey: 'active',
      permission: { feature: 'Resources Tab', action: 'view' }
    },
    {
      label: 'Inactive', link: '/project-management/projects/details/inactive-resources', icon: 'project-mangement-icons/Inactiveresource.png', statusKey: 'inactive',
      permission: { feature: 'Resources Tab', action: 'view' },
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
    active: ['assigned', 'active',],
    inactive: ['released' ],
   
  };

getcountData(projectId: any): void {
  this.loading=true
  const statuses = 'assigned,released,active';

  this.http.getData(`StatusCount?moduleName=Resource&entityId=${projectId}&statuses=${statuses}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.loading=false
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
           this.loading=false
        console.error('Error fetching phase status count', err);
      }
    });
}


  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
