import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';
@Component({
  selector: 'app-comp-off-approval-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule, SidetabsloadersComponent, DragDropModule],
  templateUrl: './comp-off-approval-tabs.component.html',
  styleUrl: './comp-off-approval-tabs.component.scss',
})

export class CompOffApprovalTabsComponent implements OnInit, OnDestroy {
  compOff = [] as any;
  rejectedCompOffRequestsCount = 0;
  waitingForApprovalCompOffCount = 0;
  approvalCompOffRequestsCount = 0;
  processedCompOffRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  loading = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedYear: any;
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  readonly tabsKey = 'timeoff-compoff-approval-tabs';

  trackByNavLink(index: number, tab: any): string {
    return tab.link;
  }

  constructor(
    public readonly router: Router,
    private http: HttpService,
    public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService,
    private readonly menuOrderService: MenuOrderService,
    private signalService: SignalsService
  ) {
    void this.menuOrderService.ensureLoaded();

    effect(() => {

      console.log('Trigger selectempid =', this.selectempid);
      if (this.http.tirggerCountSignal().compOff) {

        if (this.selectempid) {
          this.getCompOffEMPRequest();
        } else {
          this.getCompOffRequest();
        }

        this.http.tirggerCountSignal.update(status => ({
          ...status,
          compOff: false,
        }));
      }

      if (this.signalService.compOffSidNavCountTriggerSignal()) {
        if (this.selectempid) {
          this.getCompOffEMPRequest();
        } else {
          this.getCompOffRequest();
        }
      }
    });
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.selectempid = '';
        this.http.selectedEmployeeIdCompOff$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getCompOffEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getCompOffRequest();
          }
        });
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getCompOffRequest() {
    this.loading = true;
    let empId = this.empinfo.employeeId;
    this.http.getFilterCompoffDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.compOff = response;
        this.waitingForApprovalCompOffCount = this.compOff.filter((element: { status: string }) => element.status === 'Waiting for Approval').length;
        this.approvalCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Approved').length;
        this.rejectedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Rejected').length;
        this.processedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Processed').length;
        this.updateNavTabs();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching data:', error);
        this.compOff = []; // Set to empty array on error
      },
    });
  }

  getCompOffEMPRequest() {
    let empId = this.selectempid;
    this.http.getFilterCompoffDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.waitingForApprovalCompOffCount = this.compOff.filter((element: { status: string }) => element.status === 'Waiting for Approval').length;
        this.approvalCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Approved').length;
        this.rejectedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Rejected').length;
        this.processedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Processed').length;
        this.updateNavTabs();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.compOff = []; // Set to empty array on error
      },
    });
  }

  private updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: '/time-off/comp-off/waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalCompOffCount,
        permission: { feature: 'Waiting For Approval (Comp Off)', action: 'view' }
      },
      {
        label: 'Approved',
        link: '/time-off/comp-off/approved',
        icon: '/time-off-icon/approved-icon.png',
        count: this.approvalCompOffRequestsCount,
        permission: { feature: 'Approved (Comp Off)', action: 'view' }
      },
      {
        label: 'Processed',
        link: '/time-off/comp-off/processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processedCompOffRequestsCount,
        permission: { feature: 'Processed (Comp Off)', action: 'view' }
      },
      {
        label: 'Rejected',
        link: '/time-off/comp-off/rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedCompOffRequestsCount,
        permission: { feature: 'Rejected (Comp Off)', action: 'view' }
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
    this.http.setEmployeeIdCompOff(null);
  }
}
