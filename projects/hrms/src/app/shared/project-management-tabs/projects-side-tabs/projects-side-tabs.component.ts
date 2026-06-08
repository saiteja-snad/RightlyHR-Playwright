import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { TabsModule } from 'primeng/tabs';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
@Component({
  selector: 'app-projects-side-tabs',
  imports: [RouterModule, CommonModule, TabsModule, SidetabsloadersComponent],
  templateUrl: './projects-side-tabs.component.html',
  styleUrl: './projects-side-tabs.component.scss'
})

export class ProjectsSideTabsComponent {
  readonly tabsKey = 'project-management-projects-side-tabs';
  // tabs: StatusTab[] = [];
  empinfo = {} as any;
  filteredTabs: any[] = [];
  statusCounts: any = {};
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    {
      label: 'Active', link: '/project-management/projects/active', icon: 'project-mangement-icons/activeprojects.png', statusKey: 'active',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
    {
      label: 'Inactive', link: '/project-management/projects/inactive', icon: 'project-mangement-icons/Inactiveprojects.png', statusKey: 'inactive',
      permission: { feature: 'Project Details Tab', action: 'view' },
    },
    {
      label: 'On Hold ', link: '/project-management/projects/hold', icon: 'project-mangement-icons/holdprojects.png', statusKey: 'hold',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private http: HttpService, private router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
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
    this.loading = true;
    // this.loading = true;
    // this.http.getData(`StatusCount?moduleName=Project`).pipe(takeUntil(this.destroy$)).subscribe({
    //   next: (res: any) => {
    //      this.loading=false
    //     this.statusCounts = {};
    //     res.data.forEach((item: any) => {
    //       this.statusCounts[item.status.toLowerCase()] = item.count || 0;
    //     })
    //   },
    //   error: (err) => { 
    //     this.loading=false
    //   }
    // });

    let url = `StatusCount?moduleName=Project`;

  if (this.rbac.allowedToAccess('View Assigned Projects.view') && !this.rbac.allowedToAccess('View All Projects.view')) {
    url += `&employeeId=${this.empinfo.employeeId}`;
  }

  this.http.getData(url)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.loading=false
        this.statusCounts = {};

        res.data.forEach((item: any) => {
          this.statusCounts[item.status.toLowerCase()] = item.count || 0;
        })
      },
      error: (err) => { 
        this.loading=false
      }    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}