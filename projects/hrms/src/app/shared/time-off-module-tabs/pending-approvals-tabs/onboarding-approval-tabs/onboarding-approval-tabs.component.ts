import { Component, OnInit, OnDestroy, effect } from '@angular/core';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../../tabs-dnd/tabs-dnd.directive';
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
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, TabsDndDirective, SidetabsloadersComponent],
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
  tabsKey = 'pending-approvals-onboarding-tabs';
  private userInteracted = false;

  nodue_Request_data = [] as any[];
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  navLinks: NavLink[] = [
    {
      label: 'Offer Letter',
      route: '/pending-approvals/on-boarding/offer-letter-history',
      moduleId: 1,
      permission: { feature: 'Documents History Offer Letter', action: 'view' },
      icon: '/letters-icon/offer-letter-icon.png',
    },
    {
      label: 'Contract Offer Letter',
      route: '/pending-approvals/on-boarding/contractor-offer-letter-history',
      moduleId: 2,
      permission: { feature: 'Documents History Contract Offer Letter', action: 'view' },
      icon: '/letters-icon/appointment-letter-icon.png',
    },
    {
      label: 'Trainee Offer Letter',
      route: '/pending-approvals/on-boarding/intern-offer-letter-history',
      moduleId: 3,
      permission: { feature: 'Documents History Trainee Offer Letter', action: 'view' },
      icon: '/letters-icon/trainee-offer-letter-icon.png',
    },
    {
      label: 'Trainee Appointment Letter',
      route: '/pending-approvals/on-boarding/intern-appointment-letter-history',
      moduleId: 8,
      permission: { feature: 'Documents History Trainee Appointment Letter', action: 'view' },
      icon: '/letters-icon/trainee-offer-letter-icon.png',
    },
    {
      label: 'Appointment Letter',
      route: '/pending-approvals/on-boarding/appointment-letter-history',
      moduleId: 4,
      permission: { feature: 'Documents History Appointment Letter', action: 'view' },
      icon: '/letters-icon/appointment-letter-icon.png',
    },
    {
      label: 'Non-Disclosure Agreement Letter',
      route: '/pending-approvals/on-boarding/nda-letter-history',
      moduleId: 5,
      permission: { feature: 'Documents History Non-Disclosure Agreement Letter', action: 'view' },
      icon: '/my-info-icons/contractor.png',
    },
    {
      label: 'Probation',
      route: '/pending-approvals/on-boarding/probation-request',
      moduleId: 6,
      permission: { feature: 'Probation Details Tab', action: 'view' },
      icon: '/time-off-icon/Probation-icon.png',
    },
    {
      label: 'Trainees',
      route: '/pending-approvals/on-boarding/trainee-approvals',
      moduleId: 7,
      permission: { feature: 'Trainee Details Tab', action: 'view' },
      icon: '/time-off-icon/trainee-icon.png',
    },
  ];
  filteredNavLinks: NavLink[] = [];

  constructor(public readonly router: Router, private readonly http: HttpService, public readonly rbac: RbacService,
    private readonly signalService: SignalsService, private readonly accessNav: AccessNavigationService, private readonly onboardingFilter: OnboardingFilterService) {

      effect(() => {
      if ((this.http.tirggerPendingApprovalCountSignal().wfh) || (this.http.tirggerPendingApprovalCountSignal().separation)
        || (this.http.tirggerPendingApprovalCountSignal().nodue) || (this.http.tirggerPendingApprovalCountSignal().onboarding)) {
        this.getAllPendingApprovalsCount(true);
        this.http.tirggerPendingApprovalCountSignal.update(status => ({
          ...status,
          wfh: status.wfh ? false : status.wfh,
          separation: status.separation ? false : status.separation,
          nodue: status.nodue ? false : status.nodue,
        }));
      }
      if (this.signalService.OfferLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount(true);
        //this.signalService.OfferLetterNavCountSignal.set(false);
      }
      if (this.signalService.TraineeOfferLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount(true);
        //this.signalService.TraineeOfferLetterNavCountSignal.set(false);
      }
      if (this.signalService.ContractOfferLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount(true);
        //this.signalService.ContractOfferLetterNavCountSignal.set(false);
      }
      if (this.signalService.AppointmentLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount(true);
        //this.signalService.AppointmentLetterNavCountSignal.set(false);
      }
      if (this.signalService.NDALetterNavCountSignal()) {
        this.getAllPendingApprovalsCount(true);
        //this.signalService.NDALetterNavCountSignal.set(false);
      }
      
    });

 
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
    this.navLinks = this.navLinks.filter((tab: NavLink) =>
      !!tab.permission?.feature && !!tab.permission?.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.filteredNavLinks = this.navLinks;
    this.redirectIfNeeded();
  }

 getAllPendingApprovalsCount(updateAll: boolean = false) {
    this.loading = true;
    const employeeId = Number.parseInt(this.LOGIN.employeeId);
    this.http.getData(`PendingApproval/onboard-requests-count?month=${this.selectedMonth}&year=${this.selectedYear}&EmployeeId=${employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success) {
          const modules = response.data.modules;
          const moduleMap = new Map(modules.map((m: any) => [m.name, m.count]));

          if (updateAll) {
            this.navLinks = this.navLinks.map((link: NavLink) => ({
              ...link,
              count: Number(moduleMap.get(link.label)) || 0,
            })).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
            this.filteredNavLinks = [...this.navLinks];
          } else {
            const activeLink = this.navLinks.find((link: NavLink) => this.isActiveRoute(link.route));
            if (activeLink) {
              activeLink.count = Number(moduleMap.get(activeLink.label)) || 0;
              const filteredLink = this.filteredNavLinks.find(l => l.label === activeLink.label);
              if (filteredLink) filteredLink.count = activeLink.count;
            }
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

    const currentPath = this.router.url.split('?')[0];
    if (currentPath !== '/pending-approvals/on-boarding') return;

    const preferred = this.filteredNavLinks[0]?.route ?? '';
    if (!preferred || preferred === currentPath) return;
    this.router.navigate([preferred], { queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
