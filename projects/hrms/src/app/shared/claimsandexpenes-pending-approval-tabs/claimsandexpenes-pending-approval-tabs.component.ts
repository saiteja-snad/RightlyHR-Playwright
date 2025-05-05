import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-claimsandexpenes-pending-approval-tabs',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './claimsandexpenes-pending-approval-tabs.component.html',
  styleUrl: './claimsandexpenes-pending-approval-tabs.component.scss',
})
export class ClaimsandexpenesPendingApprovalTabsComponent
  implements OnInit, OnDestroy
{
  empinfo = {} as IJob;
  filteredTabs: any[] = [];
  // pendingApprovalCount: ApprovalStatusCount[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);

  navTabs = computed(() => {
    const data = this.pendingApprovalCount().find(
      (item) => item.moduleId === 19
    );
    return [
      { label: 'For You ', link: 'for-you', count: data?.forYou ?? 0,permission: { feature: 'For You (Claims and Expenses)', action: 'view' }  },
      {
        label: 'For Your Role',
        link: 'for-your-role',
        count: data?.forYourRole ?? 0,permission: { feature: 'For Role (Claims and Expenses)', action: 'view' } 
      },
    ];
  });

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllExpensesPendingApprovalsCount();
  }

  constructor(
    public readonly router: Router,
    private http: HttpService,
    private rbac: RbacService
  ) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().expenses) {
        this.getAllExpensesPendingApprovalsCount();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          expenses: false,
        }));
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getAllExpensesPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 19;

    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);
        const filtered = data.filter((item) => item.moduleId === moduleId);
        this.pendingApprovalCount.set(filtered);
        this.filterTabsByRbac();
        
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }
  
  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs()?.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
