
import { Component, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, Subject, combineLatest, takeUntil, distinctUntilChanged, skip, debounceTime } from 'rxjs';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from "../../../sidetabsloaders/sidetabsloaders.component";
import { OnboardingFilterService } from '../onboarding-filter.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../../services/theme-service/menu-order.service';

interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}

@Component({
  selector: 'app-project-management-approval-tabs',
  imports: [CommonModule, RouterModule, DragDropModule, TabsDndDirective, SidetabsloadersComponent],
  templateUrl: './project-management-approval-tabs.component.html',
  styleUrl: './project-management-approval-tabs.component.scss'
})

export class ProjectManagementApprovalTabsComponent {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount: ApprovalStatusCount[] = [];
  countEmp: any;
  countRole: any;
  loading = false;
  tabsKey = 'pending-approvals-onboarding-tabs';
  private userInteracted = false;
  nodue_Request_data = [] as any[];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  navLinks: NavLink[] = [
    {
      label: 'Timesheets',
      route: '/pending-approvals/project-management/time-sheets',
      moduleId: 30,
      permission: { feature: 'Time Sheet approval Tab', action: 'view' },
      icon: '/time-off-icon/calender-activity.png',
    },
    {
      label: 'Resource Approval',
      route: '/pending-approvals/project-management/resource-approvals',
      moduleId: 9, permission: { feature: 'Resource Approvals', action: 'view' },
      icon: 'time-off-icon/resource-approval-icon.png',
    },
  ];
  filteredNavLinks: NavLink[] = [];

  constructor(public readonly router: Router, private readonly http: HttpService, public readonly rbac: RbacService,
    private readonly signalService: SignalsService, private readonly accessNav: AccessNavigationService,
    private readonly onboardingFilter: OnboardingFilterService, private readonly menuOrderService: MenuOrderService) {
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    // Initial load with current month/year, update all tabs
    this.getAllPendingApprovalsCount(true);
    // Subscribe to changes, update only active tab
    combineLatest([this.onboardingFilter.selectedMonth$, this.onboardingFilter.selectedYear$]).pipe(
      skip(1), // Skip initial emit
      distinctUntilChanged(([prevMonth, prevYear], [currMonth, currYear]) => prevMonth === currMonth && prevYear === currYear),
      debounceTime(300), // Add debounce to prevent multiple rapid calls
      takeUntil(this.destroy$)
    ).subscribe(([month, year]) => {
      this.selectedMonth = month;
      this.selectedYear = year;
      this.getAllPendingApprovalsCount(false);
    });
    this.navLinks = this.navLinks.filter((tab: NavLink) =>
      !!tab.permission?.feature && !!tab.permission?.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.filteredNavLinks = this.navLinks;
  }

  getAllPendingApprovalsCount(updateAll: boolean = false) {
    this.loading = true;
    const employeeId = Number.parseInt(this.LOGIN.employeeId);
    const onboardCount$ = this.http.getData(`PendingApproval/onboard-requests-count?month=${this.selectedMonth}&year=${this.selectedYear}&EmployeeId=${employeeId}`).pipe(takeUntil(this.destroy$));
    const approvalCounts$ = this.http.get(`PendingApproval/getApprovalStatusCounts?EmployeeId=${employeeId}`).pipe(takeUntil(this.destroy$));

    combineLatest([onboardCount$, approvalCounts$]).subscribe({
      next: ([onboardResponse, approvalResponse]: any) => {
        let resourceApprovalCount = 0;
        if (onboardResponse?.success) {
          const modules = onboardResponse.data?.modules ?? [];
          const resourceModule = modules.find((m: any) => m.name === 'Resource Approval');
          resourceApprovalCount = Number(resourceModule?.count || 0);
        }

        const approvalCounts: any[] = Array.isArray(approvalResponse) ? approvalResponse : [];
        const timesheetEntry = approvalCounts.find((x: any) => x.moduleId === 30);
        const timesheetCount = Number(timesheetEntry?.totalCount || 0);

        const timesheetTab = this.navLinks.find((l: NavLink) => l.label === 'Timesheets');
        const resourceTab = this.navLinks.find((l: NavLink) => l.label === 'Resource Approval');

        if (updateAll) {
          const mapped = this.navLinks.map((link: NavLink) => {
            if (link.label === 'Timesheets') return { ...link, count: timesheetCount };
            if (link.label === 'Resource Approval') return { ...link, count: resourceApprovalCount };
            return { ...link, count: link.count ?? 0 };
          });
          const hasSavedPref = (this.menuOrderService.preferenceV2()?.tabs?.modules ?? [])
            .some(m => m.moduleKey === this.tabsKey);
          this.navLinks = hasSavedPref ? mapped : mapped.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
          this.filteredNavLinks = [...this.navLinks];
        } else {
          if (timesheetTab) {
            timesheetTab.count = timesheetCount;
            const filteredTimesheet = this.filteredNavLinks.find(l => l.label === 'Timesheets');
            if (filteredTimesheet) filteredTimesheet.count = timesheetCount;
          }
          if (resourceTab) {
            resourceTab.count = resourceApprovalCount;
            const filteredResource = this.filteredNavLinks.find(l => l.label === 'Resource Approval');
            if (filteredResource) filteredResource.count = resourceApprovalCount;
          }
        }
        this.loading = false;
        this.redirectIfNeeded();
      },
      error: (err: any) => {
        console.error('Error fetching approvals:', err);
        this.loading = false;
      },
    });
  }

  navigateToAccessedRoute(route: string) {
    this.userInteracted = true;
    this.onboardingFilter.setMonthYear(new Date().getMonth() + 1, new Date().getFullYear());
    this.getAllPendingApprovalsCount(true);
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  trackByNavLink(index: number, link: NavLink): string {
    return link.route;
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  private redirectIfNeeded(): void {
    if (this.userInteracted) return;
    if (!this.filteredNavLinks || this.filteredNavLinks.length === 0) return;

    const hasSavedPref = (this.menuOrderService.preferenceV2()?.tabs?.modules ?? [])
      .some(m => m.moduleKey === this.tabsKey);
    if (hasSavedPref) return;

    const currentPath = this.router.url.split('?')[0];
    if (!currentPath.startsWith('/pending-approvals/on-boarding')) return;

    const preferred = this.filteredNavLinks[0]?.route ?? '';
    if (!preferred) return;

    const actual = this.accessNav.navigateToAccessedRoute(preferred);
    const target = actual || preferred;
    if (currentPath === target || currentPath.startsWith(target + '/')) return;
    this.router.navigate([target], { queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
