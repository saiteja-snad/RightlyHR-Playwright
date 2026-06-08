import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';
@Component({
  selector: 'app-extra-hours-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule, SidetabsloadersComponent, DragDropModule],
  templateUrl: './extra-hours-tabs.component.html',
  styleUrl: './extra-hours-tabs.component.scss'
})
export class ExtraHoursTabsComponent implements OnInit, OnDestroy {
  rejectedregularizationRequestsCount = 0;
  waitingForApprovalregularizationCount = 0;
  approvalregularizationRequestsCount = 0;
  processregularizationRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  regularization = [] as any;
  loading = false;
  selectedYear: any;
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  readonly tabsKey = 'timeoff-extra-hours-approval-tabs';

  trackByNavLink(index: number, tab: any): string {
    return tab.link;
  }

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
     private TimeoffYearFilterService: TimeoffYearFilterService, private readonly menuOrderService: MenuOrderService) {
    void this.menuOrderService.ensureLoaded();
    effect(() => {
      if (this.http.tirggerCountSignal().compOff) {
        this.getRequests();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          compOff: false,
        }));
      }
    })
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getRequestsEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getRequests();
          }
        });
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getRequests() {
    this.loading = true;
    let empId = this.empinfo.employeeId;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.regularization = response;
        this.waitingForApprovalregularizationCount = this.regularization.filter(
          (element: { status: string }) =>  element.status === 'Waiting for Approval'
        ).length;
        // this.approvalregularizationRequestsCount = this.regularization.filter(
        //   (element: { status: string }) => element.status === 'Approved'
        // ).length;
        this.rejectedregularizationRequestsCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.processregularizationRequestsCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Processed'
        ).length;
        this.updateNavTabs();
        this.loading = false
      },
      error: (error) => {
        this.loading = false
        console.error('Error fetching data:', error);
        this.regularization = []; // Set to empty array on error
      },
    });
  }

  getRequestsEMPRequest() {
    let empId = this.selectempid;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.regularization = response;
        this.waitingForApprovalregularizationCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        // this.approvalregularizationRequestsCount = this.regularization.filter(
        //   (element: { status: string }) => element.status === 'Approved'
        // ).length;
        this.rejectedregularizationRequestsCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.processregularizationRequestsCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Processed'
        ).length;
        this.updateNavTabs();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.regularization = []; // Set to empty array on error
      },
    });
  }

  private updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: '/time-off/extra-hours/waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalregularizationCount,
        permission: { feature: 'Waiting For Approval (Extra Hours)', action: 'view' }
      },
      {
        label: 'Processed',
        link: '/time-off/extra-hours/process',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processregularizationRequestsCount,
        permission: { feature: 'Processed (Extra Hours)', action: 'view' }
      },
      {
        label: 'Rejected',
        link: '/time-off/extra-hours/rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedregularizationRequestsCount,
        permission: { feature: 'Rejected (Extra Hours)', action: 'view' }
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
  }

  private applySavedTabsOrder(): void {
    if (!this.filteredTabs.length) return;
    const reordered = this.menuOrderService.applySavedTabsOrder(this.tabsKey, this.filteredTabs, item => String(item?.link ?? ''));
    if (reordered !== this.filteredTabs) {
      this.filteredTabs.splice(0, this.filteredTabs.length, ...reordered);
    }
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
    this.http.setEmployeeIdRegularization(null);
  }
}
