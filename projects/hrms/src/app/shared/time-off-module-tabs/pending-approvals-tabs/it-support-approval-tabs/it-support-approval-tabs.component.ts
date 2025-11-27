import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { SidetabsloadersComponent } from '../../../sidetabsloaders/sidetabsloaders.component';

interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}
@Component({
  selector: 'app-it-support-approval-tabs',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './it-support-approval-tabs.component.html',
  styleUrl: './it-support-approval-tabs.component.scss'
})

export class ItSupportApprovalTabsComponent {
  LOGIN: any;
  subscription!: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  countEmp: any;
  countRole: any;
  loading = false;
  nodue_Request_data = [] as any[];
  navLinks: NavLink[] = [
    {
      label: 'Desks',
      route: '/time-off/pending-approvals/desk-approval',
      moduleId: environment.deskAllocationModuleId,
      permission: { feature: 'Desk Requests Tab', action: 'view' },
      icon: '/main-menu-icons/desk-icon.png',
    },
  ];

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService, 
    private signalService: SignalsService, private accessNav: AccessNavigationService) {
    effect(() => {
      if (this.signalService.timeOffsidenavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.timeOffsidenavCountSignal.set(false);
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