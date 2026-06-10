import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { TabsModule } from 'primeng/tabs';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  count?: number;
  statusKey?: string;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-projects-side-tabs',
  imports: [RouterModule, CommonModule, TabsModule, SidetabsloadersComponent, DragDropModule, TabsDndDirective],
  templateUrl: './projects-side-tabs.component.html',
  styleUrl: './projects-side-tabs.component.scss'
})

export class ProjectsSideTabsComponent {
  readonly tabsKey = 'project-management-projects-side-tabs';
  tabs: StatusTab[] = [];
  // tabs: StatusTab[] = [];
  empinfo = {} as any;
  filteredTabs: any[] = [];
  statusCounts: any = {};
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  private userInteracted = false;
  navTabs: any[] = [
    {
      tabId: '/project-management/projects/active',
      label: 'Active', link: '/project-management/projects/active', icon: 'project-mangement-icons/activeprojects.png', statusKey: 'active',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
    {
      tabId: '/project-management/projects/inactive',
      label: 'Inactive', link: '/project-management/projects/inactive', icon: 'project-mangement-icons/Inactiveprojects.png', statusKey: 'inactive',
      permission: { feature: 'Project Details Tab', action: 'view' },
    },
    {
      tabId: '/project-management/projects/hold',
      label: 'On Hold ', link: '/project-management/projects/hold', icon: 'project-mangement-icons/holdprojects.png', statusKey: 'hold',
      permission: { feature: 'Project Details Tab', action: 'view' }
    },
  ];

  constructor(public rbac: RbacService, private http: HttpService, private router: Router, private menuOrderService: MenuOrderService) { }

  ngOnInit(): void {
    void this.menuOrderService.ensureLoaded().then(() => {
      this.getcountData();
      this.rebuildTabs();
      this.http.projectcountfuntion$.subscribe(() => {
        this.getcountData();
      });
    });
  }

  private rebuildTabs(): void {
    const filtered: StatusTab[] = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
     this.tabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      filtered,
      (t) => t.tabId
    );

    this.redirectIfNeeded();
  }

  navigate(link: string): void {
    this.userInteracted = true;
    this.router.navigate([link], { queryParamsHandling: 'preserve' });
  }

  private redirectIfNeeded(): void {
    if (this.userInteracted) return;
    const currentPath = this.router.url.split('?')[0];
    if (currentPath !== '/project-management/projects') return;

    if (this.tabs.length === 0) {
      this.router.navigate(['/unauthorized']);
      return;
    }

    const preferred = this.tabs[0]?.link ?? '';
    if (!preferred || preferred === currentPath) return;
    this.router.navigate([preferred], { queryParamsHandling: 'preserve' });
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
        this.rebuildTabs();
      },
      error: (err) => {
        this.loading=false
      }    });
  }

  isActive(route: string): boolean {
    const currentPath = this.router.url.split('?')[0];
    return currentPath === route || currentPath.startsWith(route + '/');
  }

  trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }
}
