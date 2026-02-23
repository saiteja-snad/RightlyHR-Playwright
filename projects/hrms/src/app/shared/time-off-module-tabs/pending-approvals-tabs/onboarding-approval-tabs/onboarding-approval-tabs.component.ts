import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, Subject, combineLatest, takeUntil, distinctUntilChanged, skip, debounceTime } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from "../../../sidetabsloaders/sidetabsloaders.component";
import { OnboardingFilterService } from '../onboarding-filter.service';
interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-onboarding-approval-tabs',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './onboarding-approval-tabs.component.html',
  styleUrl: './onboarding-approval-tabs.component.scss'
})

export class OnboardingApprovalTabsComponent implements OnInit, OnDestroy {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount: ApprovalStatusCount[] = [];
  countEmp: any;
  countRole: any;
  loading = false;

  nodue_Request_data = [] as any[];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  navLinks: NavLink[] = [
    {
      label: 'Offer Letter',
      route: '/pending-approvals/on-boarding/offer-letter-history',
      moduleId: environment.ProbationrequestmoduleId,
      permission: { feature: 'Documents History Offer Letter', action: 'view' },
      icon: '/letters-icon/offer-letter-icon.png',
    },
    {
      label: 'Contract Offer Letter',
      route: '/pending-approvals/on-boarding/contractor-offer-letter-history',
      moduleId: environment.traineeoffboardingModuleId,
      permission: { feature: 'Documents History Contract Offer Letter', action: 'view' },
      icon: '/letters-icon/appointment-letter-icon.png',
    },
    {
      label: 'Trainee Offer Letter',
      route: '/pending-approvals/on-boarding/intern-offer-letter-history',
      moduleId: environment.ProbationrequestmoduleId,
      permission: { feature: 'Documents History Trainee Offer Letter', action: 'view' },
      icon: '/letters-icon/trainee-offer-letter-icon.png',
    },
    {
      label: 'Appointment Letter',
      route: '/pending-approvals/on-boarding/appointment-letter-history',
      moduleId: environment.traineeoffboardingModuleId,
      permission: { feature: 'Documents History Appointment Letter', action: 'view' },
      icon: '/letters-icon/appointment-letter-icon.png',
    },
    {
      label: 'Non-Disclosure Agreement Letter',
      route: '/pending-approvals/on-boarding/nda-letter-history',
      moduleId: environment.traineeoffboardingModuleId,
      permission: { feature: 'Documents History Non-Disclosure Agreement Letter', action: 'view' },
      icon: '/my-info-icons/contractor.png',
    },
    {
      label: 'Probations',
      route: '/pending-approvals/on-boarding/probation-request',
      moduleId: environment.ProbationrequestmoduleId,
      permission: { feature: 'Probation Details Tab', action: 'view' },
      icon: '/time-off-icon/Probation-icon.png',
    },
    {
      label: 'Trainees',
      route: '/pending-approvals/on-boarding/trainee-approvals',
      moduleId: environment.traineeoffboardingModuleId,
      permission: { feature: 'Trainee Details Tab', action: 'view' },
      icon: '/time-off-icon/trainee-icon.png',
    },
  ];
  filteredNavLinks: NavLink[] = [];

  constructor(public readonly router: Router, private readonly http: HttpService, public readonly rbac: RbacService,
    private readonly signalService: SignalsService, private readonly accessNav: AccessNavigationService, private readonly onboardingFilter: OnboardingFilterService) {
 
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    // Initial load with current month/year, update all tabs
    this.getAllPendingApprovalsCount(true);
    // Subscribe to changes, update only active tab
    combineLatest([this.onboardingFilter.selectedMonth$, this.onboardingFilter.selectedYear$])
      .pipe(
        skip(1), // Skip initial emit
        distinctUntilChanged(([prevMonth, prevYear], [currMonth, currYear]) => prevMonth === currMonth && prevYear === currYear),
        debounceTime(300), // Add debounce to prevent multiple rapid calls
        takeUntil(this.destroy$)
      )
      .subscribe(([month, year]) => {
        this.selectedMonth = month;
        this.selectedYear = year;
        this.getAllPendingApprovalsCount(false);
      });
    this.navLinks = this.navLinks.filter(
      (tab) => tab.permission?.feature && tab.permission?.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.filteredNavLinks = this.navLinks;
  }

  getAllPendingApprovalsCount(updateAll: boolean = false) {
    this.loading = true;
    const employeeId = Number.parseInt(this.LOGIN.employeeId);
    this.http.getData(`PendingApproval/onboard-requests-count?month=${this.selectedMonth}&year=${this.selectedYear}&EmployeeId=${employeeId}  `).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success) {
          const modules = response.data.modules;
          if (updateAll) {
            // Update all tabs on initial load
            this.navLinks = this.navLinks.map((link, index) => ({
              ...link,
              count: modules[index]?.count || 0,
            }));
            this.filteredNavLinks = [...this.navLinks];
          } else {
            // Update only the active tab when date/year changes
            const activeTabIndex = this.navLinks.findIndex(link => this.isActiveRoute(link.route));
            if (activeTabIndex !== -1 && modules[activeTabIndex]) {
              this.navLinks[activeTabIndex].count = modules[activeTabIndex].count || 0;
              this.filteredNavLinks[activeTabIndex].count = modules[activeTabIndex].count || 0;
            }
          }
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching approvals:', err);
        this.loading = false;
      },
    });
  }

  navigateToAccessedRoute(route: string) {
    this.onboardingFilter.setMonthYear(new Date().getMonth() + 1, new Date().getFullYear());
    this.getAllPendingApprovalsCount(true);
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}