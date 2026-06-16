import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';
@Component({
  selector: 'app-wfh-approvaltabs',
  standalone: true,
  imports: [CommonModule, RouterModule, TabsModule, SidetabsloadersComponent, DragDropModule],
  templateUrl: './wfh-approvaltabs.component.html',
  styleUrl: './wfh-approvaltabs.component.scss',
})

export class WfhApprovaltabsComponent implements OnInit, OnDestroy {
  compOff = [] as any;
  rejectedWFHRequestsCount = 0;
  waitingForApprovalWFHCount = 0;
  approvedWFHRequestsCount = 0;
  processedWFHRequestsCount = 0;
  selectempid: any;
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  cancelWFHRequestsCount = 0;
  empinfo = {} as IJob;
  loading = false
  destroy$: Subject<boolean> = new Subject<boolean>();
  readonly tabsKey = 'timeoff-wfh-approval-tabs';
  private userInteracted = false;

  trackByNavLink(index: number, tab: any): string {
    return tab.link;
  }

  selectedYear: any;

  constructor(
    public readonly router: Router,
    private http: HttpService,
    public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService,
    private readonly menuOrderService: MenuOrderService
  ) {
    void this.menuOrderService.ensureLoaded();
    effect(() => {
      if (this.http.tirggerCountSignal().wfh || this.http.wfhTriggerSignal()) {
        this.getWFHRequest();
        this.http.tirggerCountSignal.update((status) => ({ ...status, wfh: false }));
        this.http.wfhTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdWFH$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getCompOffEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getWFHRequest();
          }
        });
      }
    });
  }

  getWFHRequest() {
    this.loading = true
    let empId = this.empinfo.employeeId;
    this.http.getFilterWFHDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT', response);
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          const cancelled = response.filter(item => item.status === 'Cancelled');

          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          this.cancelWFHRequestsCount = cancelled.length
          this.updateNavTabs();
          this.loading = false
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => {
        this.loading = true
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-ERROR', reason);
      }
    });
  }

  getCompOffEMPRequest() {
    let empId = this.selectempid;
    this.http.getFilterWFHDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT', response);
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          const cancelled = response.filter(item => item.status === 'Cancelled');

          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          this.cancelWFHRequestsCount = cancelled.length
          this.updateNavTabs();
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-ERROR', reason);
      }
    });
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
    this.applySavedTabsOrder();
    this.redirectIfNeeded();
  }

  private applySavedTabsOrder(): void {
    if (!this.filteredTabs.length) return;
    const reordered = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      this.filteredTabs,
      item => String(item?.link ?? '')
    );
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
      '/time-off/wfh',
      '/time-off/wfh/waiting-for-approval',
      '/time-off/wfh/approved',
      '/time-off/wfh/processed',
      '/time-off/wfh/rejected',
      '/time-off/wfh/cancelled',
    ]);
    if (!entryPaths.has(currentPath)) return;

    const preferred = String(this.filteredTabs[0]?.link ?? '');
    if (!preferred || preferred === currentPath) return;
    this.router.navigate([preferred], { queryParamsHandling: 'preserve' });
  }

  isActive(link: string): boolean {
    const currentPath = this.router.url.split('?')[0];
    return currentPath === link || currentPath.startsWith(link + '/');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.filteredTabs, event.previousIndex, event.currentIndex);
    const employeeId = this.menuOrderService.getCurrentEmployeeId();
    if (!employeeId) return;

    const tabs = this.filteredTabs.map(item => ({
      id: String(item.link ?? ''),
      label: String(item.label ?? ''),
      route: String(item.link ?? '')
    }));
    this.menuOrderService.saveTabsModuleOrder(employeeId, this.tabsKey, tabs);
  }

  updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: '/time-off/wfh/waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalWFHCount,
        permission: { feature: 'Waiting For Approval (WFH)', action: 'view' },
      },
      {
        label: 'Approved',
        link: '/time-off/wfh/approved',
        icon: '/time-off-icon/approved-icon.png',
        count: this.approvedWFHRequestsCount,
        permission: { feature: 'Approved (WFH)', action: 'view' },
      },
      {
        label: 'Processed',
        link: '/time-off/wfh/processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processedWFHRequestsCount,
        permission: { feature: 'Processed (WFH)', action: 'view' },
      },
      {
        label: 'Rejected',
        link: '/time-off/wfh/rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedWFHRequestsCount,
        permission: { feature: 'Rejected (WFH)', action: 'view' },
      },
      {
        label: 'Cancelled',
        link: '/time-off/wfh/cancelled',
        icon: '/time-off-icon/cancelled-icon.png',
        count: this.cancelWFHRequestsCount,
        permission: { feature: 'Cancel (WFH)', action: 'view' },
      },
    ];
    this.filterTabsByRbac();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdWFH(null);
  }
}
