import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../../Interfaces/letters-model';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IPendingApprovals } from '../../../Interfaces/pendingapprovalsmodel';
import { ApprovalStatusCount, AttendanceRequest } from '../../../Interfaces/timoff-model';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-wfh-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './wfh-request-tabs.component.html',
  styleUrl: './wfh-request-tabs.component.scss'
})
export class WfhRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);

  navTabs = computed(() => {
    const data = this.pendingApprovalCount().find(item => item.moduleId === 2);
    return [
      { label: 'For You ', link: 'for-you', count: data?.forYou ?? 0 },
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0 }
    ];
  });


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllWFHPendingApprovalsCount();
  }
  

  constructor(public readonly router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().wfh) {
        this.getAllWFHPendingApprovalsCount();
      this.http
        .tirggerPendingApprovalCountSignal
        .update((status) => ({ ...status, wfh: false }));
      }

 
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }


  getAllWFHPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 2;
  
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
