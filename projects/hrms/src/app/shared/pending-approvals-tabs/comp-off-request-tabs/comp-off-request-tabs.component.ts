import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../../interfaces/letters-model';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ApprovalStatusCount, AttendanceRequest } from '../../../interfaces/timoff-model';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-comp-off-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './comp-off-request-tabs.component.html',
  styleUrl: './comp-off-request-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CompOffRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  pendingApprovalCount: ApprovalStatusCount[] = [];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [];





  constructor(public readonly router: Router,
    private http: HttpService
  ) {

    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().compOff) {
        this.getAllCompOffPendingApprovalsCount();
      this.http
        .tirggerPendingApprovalCountSignal
        .update((status) => ({ ...status, compOff: false }));
      }

 
    });
  }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllCompOffPendingApprovalsCount();
  }
  


  getAllCompOffPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 3;
  
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);

        this.pendingApprovalCount = data.filter(item => item.moduleId === moduleId);
        console.log(this.pendingApprovalCount);
        this.navTabs = [
          { label: 'For You ', link: 'for-you', count: this.pendingApprovalCount.at(0)?.forYou ?? 0 },
          { label: 'For Your Role', link: 'for-your-role', count: this.pendingApprovalCount.at(0)?.forYourRole ?? 0 },
        ];
        
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
