import { CommonModule } from '@angular/common';
import { Component, effect, signal, AfterViewInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaveApproval } from '../../Interfaces/pendingapprovalsmodel';
import { ApprovalStatusCount } from '../../Interfaces/timoff-model';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { SignalsService } from '../../services/signals.service';
import { SidetabsloadersComponent } from '../sidetabsloaders/sidetabsloaders.component';
import { TranslateModule } from '@ngx-translate/core';
import { OffboardingChecklistService, ChecklistItem } from '../../services/offboarding-checklist.service';
import { ModuleNavigationService } from '../../services/module-navigation.service';
import { OffboardingReloadService } from '../../services/offboarding-reload.service';

interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}

@Component({
  selector: 'app-offboarding-employeeapprovals-tabs',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent,TranslateModule],
  templateUrl: './offboarding-employeeapprovals-tabs.component.html',
  styleUrl: './offboarding-employeeapprovals-tabs.component.scss'
})
export class OffboardingEmployeeapprovalsTabsComponent implements AfterViewInit {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  countEmp: any;
  countRole: any;
  loading = false;
  nodue_Request_data = [] as any[];
  currentStep = 0;
  stagestatus = false;
  empinfo: any;
  checklistItems: ChecklistItem[] = [];

  navLinks: NavLink[] = [
    {
      label: 'Leaves',
      route: '/personalinfo/job/employmentType/initate-offboarding/leave-approvals',
      moduleId: environment.leavesModuleId,
      permission: { feature: 'Employee Info Offboarding Details', action: 'view' },
      icon: '/time-off-icon/leaves-icon.png',
    },
    {
      label: 'WFH',
      route: '/personalinfo/job/employmentType/initate-offboarding/wfh-approvals',
      moduleId: environment.wfhModuleId,
      icon: '/time-off-icon/WFH-icon.png',
      permission: { feature: 'WFH Tab', action: 'view' },
    },
    {
      label: 'Remote Login',
      route: '/personalinfo/job/employmentType/initate-offboarding/remote-login-approvals',
      moduleId: environment.remoteLoginModuleId,
      icon: '/time-off-icon/remote-login-icon.png',
      permission: { feature: 'Remote Login Tab', action: 'view' },
    },
    {
      label: 'Comp-Off',
      route: '/personalinfo/job/employmentType/initate-offboarding/compoff-approvals',
      moduleId: environment.compoffModuleId,
      icon: '/time-off-icon/comp-off.png',
      permission: { feature: 'Comp Off Tab', action: 'view' },
    },
    {
      label: 'Permissions',
      route: '/personalinfo/job/employmentType/initate-offboarding/permissions-approvals',
      moduleId: environment.permissionsModuleId,
      icon: '/time-off-icon/permissions-icon.png',
      permission: { feature: 'Permissions Tab', action: 'view' },
    },
    {
      label: 'Extra Hours',
      route: '/personalinfo/job/employmentType/initate-offboarding/extrahours-approvals',
      moduleId: environment.extraHoursModuleId,
      icon: '/time-off-icon/extra-logs.png',
      permission: { feature: 'Extra Hours Tab', action: 'view' },
    },
    {
      label: 'Regularizations',
      route: '/personalinfo/job/employmentType/initate-offboarding/regularization-approvals',
      moduleId: environment.attendanceRegularizationModuleId,
      icon: '/time-off-icon/regularization-icon.png',
      permission: { feature: 'Regularization Tab', action: 'view' },
    },
    {
      label: 'Expenses',
      route: '/personalinfo/job/employmentType/initate-offboarding/expenses-approvals',
      moduleId: environment.expensesModuleId,
      icon: '/time-off-icon/expenses-icon.png',
      permission: { feature: 'Expenses Tab', action: 'view' },
    },
    {
      label: 'Timesheet Entries',
      route: '/personalinfo/job/employmentType/initate-offboarding/timesheet-approvals',
      moduleId: environment.timesheetModuleId,
      icon: '/time-off-icon/timesheet-icon.png',
      permission: { feature: 'Timesheet Entries Tab', action: 'view' },
    },
    {
      label: 'Employee Info',
      route: '/personalinfo/job/employmentType/initate-offboarding/employee-info-approvals',
      moduleId: environment.pendingapprovalemployeid,
      icon: '/time-off-icon/expenses-icon.png',
      permission: { feature: 'Employee Info Tab', action: 'view' },
    },
  ];

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
    private signalService: SignalsService, private accessNav: AccessNavigationService,
    private offboardingChecklistService: OffboardingChecklistService,
    private moduleNavService: ModuleNavigationService,private reloadService: OffboardingReloadService) {
      // Initialize checklist items from service
      this.checklistItems = this.offboardingChecklistService.getChecklistItems();
      if (this.checklistItems.length === 0) {
        this.checklistItems = this.offboardingChecklistService.getDefaultChecklistItems();
        this.offboardingChecklistService.setChecklistItems(this.checklistItems);
      }

    this.reloadService.reloadTrigger$.subscribe(() => {
       if (this.router.url.includes('/initate-offboarding') && 
        !this.router.url.includes('/approval-requests')) {
      this.getAllPendingApprovalsCount();
        }
    });
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('personaldata') || '{}');

    // Initialize with default items if empty
    if (this.checklistItems.length === 0) {
      this.checklistItems = this.offboardingChecklistService.getDefaultChecklistItems();
    }

    // Only load data if we're on the employee route
    if (this.router.url.includes('/initate-offboarding') && 
        !this.router.url.includes('/approval-requests')) {
      this.getAllPendingApprovalsCount();
    }

    this.navLinks = this.navLinks.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  ngAfterViewInit(): void {
    // Also store after view init to ensure it's available
    this.storeChecklistItems();
  }

  storeChecklistItems(): void {
    try {
      // Get default items from service if current items are empty
      if (this.checklistItems.length === 0) {
        this.checklistItems = this.offboardingChecklistService.getDefaultChecklistItems();
      }
      // Use the service to store checklist items
      this.offboardingChecklistService.setChecklistItems(this.checklistItems);
    } catch (error) {
      console.error('Error storing checklist items:', error);
    }
  }

  // Public method that can be called from other components
  public getChecklistItemsForOffboarding(): ChecklistItem[] {
    this.storeChecklistItems(); // Ensure items are stored
    return this.checklistItems;
  }

  getAllPendingApprovalsCount() {
    this.loading = true;
    const employeeId = parseInt(this.LOGIN.employeeId);
    this.http.getData(`Timeoff/GetEmployeeDataByModule?employeeId=${employeeId}`).subscribe({
      next: (data: any) => {
        console.log('Pending approvals count data:', data.modules);
        const countMap = new Map<number, number>();
        data.modules.forEach((item:any) => countMap.set(item?.moduleId, item.totalCount));

        // Update navLinks with counts
        this.navLinks = this.navLinks.map((link) => ({
          ...link,
          count: countMap.get(link.moduleId) || 0,
        }));

        // Update checklistItems with counts - use map to create new array
        this.checklistItems = this.checklistItems.map((item) => ({
          ...item,
          count: item.moduleId != null ? countMap.get(item.moduleId) || 0 : 0,
        }));
        this.loading = false;
        // Fetch offboarding data after counts are updated
        this.getinitateoffboardingdata();
      },
      error: (err) => {
        console.error('Error fetching approvals:', err);
        this.loading = false;
        // Still fetch offboarding data even if count fetch fails
        this.getinitateoffboardingdata();
      },
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }

  getinitateoffboardingdata() {
    const empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.subscription = this.http.getData(`OffboardingTracker/employee/${empinfo.employeeId}?stageType=Emp`).subscribe({
      next: (data: any) => {
        const checklistItems = data.data || [];
        this.updateChecklistStatus(checklistItems);
        this.stagestatus = checklistItems.length > 0 &&
          checklistItems.some((item: any) => item.status === 'InProgress');
      },
      error: (err: any) => { console.log(err) }
    });
  }

  updateChecklistStatus(apiData: any[]) {
    // Update checklist items based on API data - create completely new array
    this.checklistItems = this.checklistItems.map((item) => {
      const apiItem = apiData.find(data => data.moduleId === item.moduleId);
      
      if (apiItem) {
        // Mark as completed only if status is 'Completed' or 'Skipped'
        const isCompleted = apiItem.status === 'Completed' || apiItem.status === 'Skipped';
        return {
          ...item,
          completed: isCompleted,
          status: apiItem.status
        };
      } else {
        // If no API item found, mark as not completed
        return {
          ...item,
          completed: false
        };
      }
    });
    // DO NOT update the shared service - keep local state only
    // this.offboardingChecklistService.setChecklistItems(this.checklistItems);

    // Find first incomplete item and set as current step
    const firstIncompleteIndex = this.checklistItems.findIndex(item => !item.completed);
    this.currentStep = firstIncompleteIndex !== -1 ? firstIncompleteIndex : this.checklistItems.length - 1;
  }

  // Method to get completed count for display
  getCompletedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }

  // Method to manually navigate to current step using the navigation service
  navigateToCurrentStep() {
    const currentItem = this.checklistItems[this.currentStep];
    if (currentItem && currentItem.moduleId != null) {
      this.moduleNavService.navigateToOffboardingRoute(currentItem.moduleId!);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
