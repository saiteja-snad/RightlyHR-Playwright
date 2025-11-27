import { Component, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from "../../../sidetabsloaders/sidetabsloaders.component";

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

export class OnboardingApprovalTabsComponent {
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
  navLinks: NavLink[] = [
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

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
    private signalService: SignalsService, private accessNav: AccessNavigationService) {
    effect(() => {
      if (this.signalService.probationDetailsTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.probationDetailsTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsCount();
    this.navLinks = this.navLinks.filter(
      (tab) => tab.permission && tab.permission.feature && tab.permission.action &&
        this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  getAllPendingApprovalsCount() {
    this.loading = true;
    const employeeId = parseInt(this.LOGIN.employeeId);
    this.http.getAllPendingApprovalsCount(undefined, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const countMap = new Map<number, number>();
        data.forEach((item) => countMap.set(item.moduleId, item.totalCount));
        this.navLinks = this.navLinks.map((link) => ({
          ...link,
          count: countMap.get(link.moduleId) || 0,
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching approvals:', err);
        this.loading = false;
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}