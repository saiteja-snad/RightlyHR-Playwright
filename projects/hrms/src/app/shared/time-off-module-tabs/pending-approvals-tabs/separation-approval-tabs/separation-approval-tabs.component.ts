
import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../../tabs-dnd/tabs-dnd.directive';
import { Subscription, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
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
  selector: 'app-separation-approval-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, TabsDndDirective, SidetabsloadersComponent],
  templateUrl: './separation-approval-tabs.component.html',
  styleUrl: './separation-approval-tabs.component.scss'
})

export class SeparationApprovalTabsComponent {
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
  tabsKey = 'pending-approvals-separation-tabs';
  filteredNavLinks: NavLink[] = [];
  private userInteracted = false;
  navLinks: NavLink[] = [
    {
      label: 'Separations',
      route: '/pending-approvals/off-boarding/separation-request',
      moduleId: environment.SeparationrequestmoduleId,
      permission: { feature: 'Separation Request Tab', action: 'view' },
      icon: '/time-off-icon/seperation-icon.png',
    },
    {
      label: 'Recalls',
      route: '/pending-approvals/off-boarding/recall-request',
      moduleId: environment.RecallrequestmoduleId,
      permission: { feature: 'Recall Request Tab', action: 'view' },
      icon: '/time-off-icon/recall-icon.png',
    },
    {
      label: 'No Due Clearances',
      route: '/pending-approvals/off-boarding/nodue-request',
      moduleId: environment.nodueModuleId,
      permission: { feature: 'No Due Clearence Requests Tab', action: 'view' },
      icon: '/time-off-icon/No-due-icon.png',
    },
  ];

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
    private signalService: SignalsService, private accessNav: AccessNavigationService) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().separation || this.http.tirggerPendingApprovalCountSignal().nodue) {
        this.getAllPendingApprovalsCount();
        this.getAllPendingApprovalsNoDue();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          separation: status.separation ? false : status.separation,
          nodue: status.nodue ? false : status.nodue,
        }));
      }
      if (this.signalService.separationSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.separationSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.recallSeparationSidNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.recallSeparationSidNavCountTriggerSignal.set(false);
      }
      if (this.signalService.noDueSideNavCountTriggerSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.noDueSideNavCountTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsCount();
    this.getAllPendingApprovalsNoDue();
    this.navLinks = this.navLinks.filter((tab: NavLink) =>
      !!tab.permission?.feature && !!tab.permission?.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.filteredNavLinks = this.navLinks;
    this.redirectIfNeeded();
  }

  getAllPendingApprovalsNoDue() {
    const EmployeeId = this.LOGIN.employeeId;
    this.subscription = this.http.getData(`NoDueClearanceForm/getByApproverIdPendingApprovals/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.nodue_Request_data = data;
        // Update the count for No Due Clearances tab based on array length
        const noDueLink = this.navLinks.find(link => link.label === 'No Due Clearances');
        if (noDueLink) {
          noDueLink.count = data?.length || 0;
        }
        const filteredNoDueLink = this.filteredNavLinks.find(link => link.label === 'No Due Clearances');
        if (filteredNoDueLink) {
          filteredNoDueLink.count = noDueLink?.count || 0;
        }
      },
    });
  }

  getAllPendingApprovalsCount() {
    this.loading = true;
    const employeeId = parseInt(this.LOGIN.employeeId);
    this.http.getAllPendingApprovalsCount(undefined, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const countMap = new Map<number, number>();
        data.forEach((item) => countMap.set(item.moduleId, item.totalCount));
        this.navLinks = this.navLinks.map((link: NavLink) => ({
          ...link,
          count: countMap.get(link.moduleId) || 0,
        }));
        this.filteredNavLinks = [...this.navLinks];
        this.loading = false;
        this.redirectIfNeeded();
      },
      error: (err) => {
        console.error('Error fetching approvals:', err);
        this.loading = false;
      },
    });
  }

  navigateToAccessedRoute(route: string) {
    this.userInteracted = true;
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
    if (currentPath !== '/pending-approvals/off-boarding') return;

    const preferred = this.filteredNavLinks[0]?.route ?? '';
    if (!preferred || preferred === currentPath) return;
    const actual = this.accessNav.navigateToAccessedRoute(preferred);
    this.router.navigate([actual || preferred], { queryParamsHandling: 'preserve' });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
