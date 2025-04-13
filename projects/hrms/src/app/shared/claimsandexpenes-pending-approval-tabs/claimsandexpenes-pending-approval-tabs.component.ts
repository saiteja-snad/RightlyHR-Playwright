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
  // pendingApprovalCount: ApprovalStatusCount[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);

  navTabs = computed(() => {
    const data = this.pendingApprovalCount().find(
      (item) => item.moduleId === 19
    );
    return [
      { label: 'For You ', link: 'for-you', count: data?.forYou ?? 0 },
      {
        label: 'For Your Role',
        link: 'for-your-role',
        count: data?.forYourRole ?? 0,
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
    
        
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
