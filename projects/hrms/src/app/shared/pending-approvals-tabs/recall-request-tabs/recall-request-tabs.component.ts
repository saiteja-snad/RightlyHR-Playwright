import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment.dev';

@Component({
  selector: 'app-recall-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './recall-request-tabs.component.html',
  styleUrl: './recall-request-tabs.component.scss'
})
export class RecallRequestTabsComponent {
  
  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);

  navTabs = computed(() => {
    const moduleId = environment.RecallrequestmoduleId;
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    return [
      { label: 'For You ', link: 'recall-for-you', count: data?.forYou ?? 0 },
      { label: 'For Your Role', link: 'recall-for-role', count: data?.forYourRole ?? 0 }
    ];
  });
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllSeparationPendingApprovalsCount();
  }
  constructor(public readonly router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().recall) {
        this.getAllSeparationPendingApprovalsCount();
      this.http
        .tirggerPendingApprovalCountSignal
        .update((status) => ({ ...status, recall: false }));
      }

 
    });
  }

  getAllSeparationPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.RecallrequestmoduleId;
  
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
