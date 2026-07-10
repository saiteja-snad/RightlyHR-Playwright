import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-projects-side-tabs-for-clients',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './projects-side-tabs-for-clients.component.html',
  styleUrl: './projects-side-tabs-for-clients.component.scss'
})

export class ProjectsSideTabsForClientsComponent {
  filteredTabs: any[] = [];
  statusCounts: any = {};
  projectId: any
  empinfo = {} as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    {
      label: 'Active', link: '/project-management/clients/details/projects', icon: '/my-info-icons/contact-icon.png', statusKey: 'active',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
    {
      label: 'Inactive', link: '/project-management/clients/details/inactiveprojects', icon: 'main-menu-icons/project-management-project.png', statusKey: 'inactive',
      permission: { feature: 'Project Details Tab', action: 'view' },
    },
    {
      label: 'On Hold ', link: '/project-management/clients/details/hold', icon: 'main-menu-icons/project-management-resources.png', statusKey: 'hold',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private router: Router, private http: HttpService, private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        this.getcountData(this.projectId)
      }
    });
    this.filterTabsByRbac();
    this.http.projectcountfuntion$.subscribe(() => {
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

  getcountData(projectid: any): void {
    let url = `StatusCount?moduleName=Project&entityId=${projectid}`;

  if (this.rbac.allowedToAccess('View Assigned Projects.view') && !this.rbac.allowedToAccess('View All Projects.view')) {
    url += `&employeeId=${this.empinfo.employeeId}`;
  }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.statusCounts = {};
        res.data.forEach((item: any) => {
          this.statusCounts[item.status.toLowerCase()] = item.count || 0;
        })
      },
      error: (err) => { }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
