import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';
@Component({
  selector: 'app-premissions-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule, SidetabsloadersComponent, DragDropModule],
  templateUrl: './premissions-tabs.component.html',
  styleUrl: './premissions-tabs.component.scss'
})

export class PremissionsTabsComponent implements OnInit, OnDestroy {
  wfh = [] as any;
  rejectedPermissionsRequestsCount = 0;
  waitingForApprovalPermissionsCount = 0;
  approvalPermissionsRequestsCount = 0;
  cancelPermissionsRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  loadiing = false;
  selectedYear: any;
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  readonly tabsKey = 'timeoff-permissions-approval-tabs';
  private userInteracted = false;

  trackByNavLink(index: number, tab: any): string {
    return tab.link;
  }

  constructor(
    public readonly router: Router,
    private http: HttpService,
    public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService,
    private readonly menuOrderService: MenuOrderService
  ) {
    void this.menuOrderService.ensureLoaded();
    effect(() => {
      if (this.http.permissionTriggerSignal()) {
        this.getPermissionRequest();
      }
    })
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdPermission$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getPermissionEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getPermissionRequest();
          }
        });
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getPermissionRequest() {
    this.loadiing = true
    let empId = this.empinfo.employeeId;
    this.http.getFilterPermissionDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfh = response;
        this.waitingForApprovalPermissionsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        this.approvalPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Processed' || element.status === 'Approved'
        ).length;
        this.rejectedPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.cancelPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Cancelled'
        ).length;
        this.updateNavTabs();
        this.loadiing = false
      },
      error: (error) => {
        this.loadiing = false
        console.error('Error fetching data:', error);
        this.wfh = []; // Set to empty array on error
      },
    });
  }

  getPermissionEMPRequest() {
    let empId = this.selectempid;
    this.http.getFilterPermissionDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfh = response;
        this.waitingForApprovalPermissionsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        this.approvalPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Processed' || element.status === 'Approved'
        ).length;
        this.rejectedPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.cancelPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Cancelled'
        ).length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.wfh = []; // Set to empty array on error
      },
    });
  }

  private updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: '/time-off/premissions/waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalPermissionsCount,
        permission: { feature: 'Waiting For Approval (Permissions)', action: 'view' }
      },
      {
        label: 'Processed',
        link: '/time-off/premissions/processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.approvalPermissionsRequestsCount,
        permission: { feature: 'Processed (Permissions)', action: 'view' }
      },
      {
        label: 'Rejected',
        link: '/time-off/premissions/rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedPermissionsRequestsCount,
        permission: { feature: 'Rejected (Permissions)', action: 'view' }
      },
      {
        label: 'Cancelled',
        link: '/time-off/premissions/cancelled',
        icon: '/time-off-icon/cancelled-icon.png',
        count: this.cancelPermissionsRequestsCount,
        permission: { feature: 'Cancel (Permissions)', action: 'view' }
      }
    ];
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      return this.rbac.allowedToAccess(`${feature}.${action}`);
    });
    this.applySavedTabsOrder();
    this.redirectIfNeeded();
  }

  private applySavedTabsOrder(): void {
    if (!this.filteredTabs.length) return;
    const reordered = this.menuOrderService.applySavedTabsOrder(this.tabsKey, this.filteredTabs, item => String(item?.link ?? ''));
    if (reordered !== this.filteredTabs) {
      this.filteredTabs.splice(0, this.filteredTabs.length, ...reordered);
    }
  }

  navigate(link: string): void {
    this.userInteracted = true;
    this.router.navigate([link], { queryParamsHandling: 'preserve' });
  }

  private redirectIfNeeded(): void {
    if (this.userInteracted) return;
    if (!this.filteredTabs.length) return;

    const currentPath = this.router.url.split('?')[0];
    const entryPaths = new Set([
      '/time-off/premissions',
      '/time-off/premissions/waiting-for-approval',
      '/time-off/premissions/processed',
      '/time-off/premissions/rejected',
      '/time-off/premissions/cancelled',
    ]);
    if (!entryPaths.has(currentPath)) return;

    const preferred = String(this.filteredTabs[0]?.link ?? '');
    if (!preferred || preferred === currentPath) return;
    this.router.navigate([preferred], { queryParamsHandling: 'preserve' });
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.filteredTabs, event.previousIndex, event.currentIndex);
    const employeeId = this.menuOrderService.getCurrentEmployeeId();
    if (!employeeId) return;
    const tabs = this.filteredTabs.map(item => ({ id: String(item.link ?? ''), label: String(item.label ?? ''), route: String(item.link ?? '') }));
    this.menuOrderService.saveTabsModuleOrder(employeeId, this.tabsKey, tabs);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdPermission(null);
  }
}
