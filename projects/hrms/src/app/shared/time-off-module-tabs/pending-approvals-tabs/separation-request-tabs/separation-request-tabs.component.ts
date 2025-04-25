import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-separation-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './separation-request-tabs.component.html',
  styleUrl: './separation-request-tabs.component.scss'
})

export class SeparationRequestTabsComponent {
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
    const moduleId=environment.SeparationrequestmoduleId
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    return [
      { label: 'For You ', link: 'separation-for-you', count: data?.forYou ?? 0 },
      { label: 'For Your Role', link: 'separation-for-role', count: data?.forYourRole ?? 0}
    ];
  });

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllSeparationPendingApprovalsCount();
  }

  constructor(public readonly router: Router, private http: HttpService) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().separation) {
        this.getAllSeparationPendingApprovalsCount();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({ ...status, separation: false }));
      }
    });
  }

  getAllSeparationPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.SeparationrequestmoduleId;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const filtered = data.filter(item => item.moduleId === moduleId);
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