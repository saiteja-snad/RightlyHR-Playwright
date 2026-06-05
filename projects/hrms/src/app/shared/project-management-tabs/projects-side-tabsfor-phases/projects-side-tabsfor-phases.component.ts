import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

interface PhaseTab {
  tabId: string;
  label: string;
  link: string;
  icon: string;
  statusKey: 'active' | 'inactive' | 'hold';
  permission?: { feature: string; action: string };
}

@Component({
  selector: 'app-projects-side-tabsfor-phases',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent, DragDropModule, TabsDndDirective],
  templateUrl: './projects-side-tabsfor-phases.component.html',
  styleUrl: './projects-side-tabsfor-phases.component.scss'
})
export class ProjectsSideTabsforPhasesComponent {
  readonly tabsKey = 'project-management-phases-side-tabs';
  filteredTabs: PhaseTab[] = [];
  statusCounts: any = {};
  projectId: any;
  loading=false
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: PhaseTab[] = [
    {
      tabId: '/project-management/projects/details/phases',
      label: 'Active', link: '/project-management/projects/details/phases', icon: 'project-mangement-icons/activePhases.png', statusKey: 'active',
      permission: { feature: 'Project Phases Tab', action: 'view' }
    },
    {
      tabId: '/project-management/projects/details/inactive-phases',
      label: 'Inactive', link: '/project-management/projects/details/inactive-phases', icon: 'project-mangement-icons/inactivePhases.png', statusKey: 'inactive',
      permission: { feature: 'Project Phases Tab', action: 'view' },
    },
    {
      tabId: '/project-management/projects/details/hold-phases',
      label: 'On Hold', link: '/project-management/projects/details/hold-phases', icon: 'project-mangement-icons/holdPhases.png', statusKey: 'hold',
      permission: { feature: 'Project Phases Tab', action: 'view' },
    },


  ];

  constructor(public rbac: RbacService, private http: HttpService, private route: ActivatedRoute, private router: Router,private menuOrderService: MenuOrderService) { }

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
    const filtered = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });

    this.filteredTabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      filtered,
      (t) => t.tabId
    );
  }

  statusGroups: any = {
    active: ['yet to start', 'in progress', 'extended'],
    inactive: ['completed', 'closed'],
    hold: ['hold']
  };

getcountData(projectId: any): void {
  this.loading=true
  const statuses = 'yet to start,in progress,extended,hold,completed,closed';
  this.http.getData(`StatusCount?moduleName=Phase&entityId=${projectId}&statuses=${statuses}`)
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

  trackByTabId(_: number, tab: PhaseTab): string {
    return tab.tabId;
  }

}
