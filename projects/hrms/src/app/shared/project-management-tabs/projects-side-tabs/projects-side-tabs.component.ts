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
  statusCounts: any = {};
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
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
    this.getcountData();
    this.rebuildTabs();
    this.http.projectcountfuntion$.subscribe(() => {
      this.getcountData();
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

    const baseUrl = '/project-management/projects';
    if (this.router.url === baseUrl && this.tabs.length > 0) {
      this.router.navigateByUrl(this.tabs[0].link);
    }
  }

  getcountData(): void {
    this.loading = true;
    this.http.getData(`StatusCount?moduleName=Project`).pipe(takeUntil(this.destroy$)).subscribe({
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
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }
}
