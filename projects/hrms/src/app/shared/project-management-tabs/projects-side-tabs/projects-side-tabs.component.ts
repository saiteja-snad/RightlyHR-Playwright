import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-projects-side-tabs',
  imports: [RouterModule, CommonModule,TabsModule],
  templateUrl: './projects-side-tabs.component.html',
  styleUrl: './projects-side-tabs.component.scss'
})
export class ProjectsSideTabsComponent {
  filteredTabs: any[] = [];
  statusCounts:any = {};
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [

    {
      label: 'Active', link: '/project-management/projects/active', icon: '/my-info-icons/contact-icon.png', statusKey: 'active',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
    {
      label: 'Inactive', link: '/project-management/projects/inactive', icon: 'main-menu-icons/project-management-project.png', statusKey: 'inactive',
      permission: { feature: 'Project Details Tab', action: 'view' },
    },
    {
      label: 'Hold ', link: '/project-management/projects/hold', icon: 'main-menu-icons/project-management-resources.png', statusKey: 'hold',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },

  ];

  constructor(public rbac: RbacService, private router: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.getcountData();
    this.filterTabsByRbac();
    this.http.projectcountfuntion$.subscribe(() => {
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
    this.http.getData(`StatusCount?moduleName=Project`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.statusCounts = {};
        res.data.forEach((item: any) => {
          this.statusCounts[item.status.toLowerCase()] = item.count ||0;
        })
      },
      error: (err) => {

      }
    });
  }

 isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
