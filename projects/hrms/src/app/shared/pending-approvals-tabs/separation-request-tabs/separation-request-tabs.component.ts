import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApprovalStatusCount } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IJob } from '../../../Interfaces/job-model';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-separation-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './separation-request-tabs.component.html',
  styleUrl: './separation-request-tabs.component.scss'
})
export class SeparationRequestTabsComponent {

  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);

  navTabs = computed(() => {
    const data = this.pendingApprovalCount().find(item => item.moduleId === 13);
    return [
      { label: 'For You ', link: 'separation-for-you', count: data?.forYou ?? 0 },
      { label: 'For Your Role', link: 'separation-for-role', count: data?.forYourRole ?? 0 }
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
      if (this.http.tirggerPendingApprovalCountSignal().separation) {
        this.getAllSeparationPendingApprovalsCount();
      this.http
        .tirggerPendingApprovalCountSignal
        .update((status) => ({ ...status, separation: false }));
      }

 
    });
  }

  getAllSeparationPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 13;
  
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
