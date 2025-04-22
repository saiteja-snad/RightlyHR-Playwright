import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../../Interfaces/job-model';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { ApprovalStatusCount } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment.dev';

@Component({
  selector: 'app-desk-request-tabs',
  imports: [TabsModule,RouterModule,CommonModule],
  templateUrl: './desk-request-tabs.component.html',
  styleUrl: './desk-request-tabs.component.scss'
})
export class DeskRequestTabsComponent {
  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);

  navTabs = computed(() => {
    const moduleId=environment.deskAllocationModuleId;
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    return [
      { label: 'For You ', link: 'for-you', count: data?.forYou ?? 0 },
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0}
    ];
  });
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllDeskPendingApprovalsCount();
  }
  constructor(public readonly router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().separation) {
        this.getAllDeskPendingApprovalsCount();
      this.http
        .tirggerPendingApprovalCountSignal
        .update((status) => ({ ...status, separation: false }));
      }

 
    });
  }

  getAllDeskPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.deskAllocationModuleId;
  
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);
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
