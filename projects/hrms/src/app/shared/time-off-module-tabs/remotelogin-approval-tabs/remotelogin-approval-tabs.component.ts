import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';
import { environment } from '../../../../environments/environment';
import { SignalsService } from '../../../services/signals.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';
@Component({
  selector: 'app-remotelogin-approval-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule, SidetabsloadersComponent, DragDropModule],
  templateUrl: './remotelogin-approval-tabs.component.html',
  styleUrl: './remotelogin-approval-tabs.component.scss',
})
export class RemoteloginApprovalTabsComponent implements OnInit, OnDestroy {
  remoteLogin = [] as any;
  rejectedRemoteLoginRequestsCount = 0;
  waitingForApprovalRemoteLoginCount = 0;
  approvalRemoteLoginRequestsCount = 0;
  processedRemoteLoginRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  loading = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedYear: any;
  remoteLoginModuleId = environment.remoteLoginModuleId;
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  readonly tabsKey = 'timeoff-remotelogin-status-tabs';

  trackByNavLink(index: number, tab: any): string {
    return tab.link;
  }

  constructor(
    public readonly router: Router,
    private http: HttpService,
    public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService,
    private signalsService: SignalsService,
    private readonly menuOrderService: MenuOrderService
  ) {
    void this.menuOrderService.ensureLoaded();
    effect(() => {
      if (this.signalsService.remoteLoginSidNavCountTriggerSignal()) {
        if (this.selectempid) {
          this.getRemoteLoginEMPRequest();
        } else {
          this.getRemoteLoginRequest();
        }
      }
    });
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe((year) => {
      if (year !== null) {
        this.selectedYear = year;
        this.selectempid = '';
        this.http.selectedEmployeeIdRemoteLogin$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getRemoteLoginEMPRequest();
            console.log(`Selected Employee ID: ${this.selectempid}`);
            
          } else {
            this.empinfo = JSON.parse(
              localStorage.getItem('rightlyHrUser') ?? '{}'
            );
            this.getRemoteLoginRequest();
          }
        });
      }
    });
    console.log("Hello from the side component");
    
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getRemoteLoginRequest() {
    this.loading = true;
    let empId = this.empinfo.employeeId;
    this.http
      .getFilterRemoteLoginDataByID(
        empId,
        this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.remoteLogin = response;
           if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');

          this.waitingForApprovalRemoteLoginCount = waiting.length;
          this.approvalRemoteLoginRequestsCount = approved.length;
          this.rejectedRemoteLoginRequestsCount = rejected.length;
          this.processedRemoteLoginRequestsCount = processed.length;
          this.updateNavTabs();
        } else {
          console.error('Invalid response format');
        }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching data:', error);
          this.remoteLogin = []; // Set to empty array on error
        },
      });
  }

  getRemoteLoginEMPRequest() {
    let empId = this.selectempid;
    this.http
      .getFilterRemoteLoginDataByID(
        empId,
        this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.remoteLogin = response;
           if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');

          this.waitingForApprovalRemoteLoginCount = waiting.length;
          this.approvalRemoteLoginRequestsCount = approved.length;
          this.rejectedRemoteLoginRequestsCount = rejected.length;
          this.processedRemoteLoginRequestsCount = processed.length;
          this.updateNavTabs();
        } else {
          console.error('Invalid response format');
        }
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.remoteLogin = []; // Set to empty array on error
        },
      });
  }

updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: 'waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalRemoteLoginCount,
        permission: { feature: 'Waiting For Approval (Remote Login)', action: 'view' },
      },
      {
        label: 'Approved',
        link: 'approved',
        icon: '/time-off-icon/approved-icon.png',
        count: this.approvalRemoteLoginRequestsCount,
        permission: { feature: 'Approved (Remote Login)', action: 'view' },
      },
      {
        label: 'Processed',
        link: 'processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processedRemoteLoginRequestsCount,
        permission: { feature: 'Processed (Remote Login)', action: 'view' },
      },
      {
        label: 'Rejected',
        link: 'rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedRemoteLoginRequestsCount,
        permission: { feature: 'Rejected (Remote Login)', action: 'view' },
      }
    ];
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
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