import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-wfh-approvaltabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './wfh-approvaltabs.component.html',
  styleUrl: './wfh-approvaltabs.component.scss',
})

export class WfhApprovaltabsComponent implements OnInit, OnDestroy {
  compOff = [] as any;
  rejectedWFHRequestsCount = 0;
  waitingForApprovalWFHCount = 0;
  approvedWFHRequestsCount = 0;
  processedWFHRequestsCount = 0;
  selectempid: any;
 navTabs: any[] = [];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public readonly router: Router, private http: HttpService,public rbac: RbacService) {
    effect(() => {
      if (this.http.tirggerCountSignal().wfh) {
        this.getCompOffRequest();
        this.http.tirggerCountSignal.update((status) => ({ ...status, wfh: false }));
      }
    });
  }

  ngOnInit(): void {
        this.http.selectedEmployeeIdWFH$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getCompOffEMPRequest();
      }
      else{
        this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCompOffRequest();
      }
    });
     this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCompOffRequest();
  }
  getCompOffRequest() {
    console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-0');
   let empId = this.empinfo.employeeId;
    this.http.getData(`Timeoff/getWorkFromHomeRequests/${empId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
          console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT',response);
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
         // const cancelled = response.filter(item => item.status === 'Cancelled');

          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          console.log('processedCount',this.waitingForApprovalWFHCount);
         // this.cancelCount=cancelled.length

          this.updateNavTabs();
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-ERROR', reason);
      }
    });
  }

  getCompOffEMPRequest() {
    console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-0');
   let empId = this.selectempid;
    this.http.getData(`Timeoff/getWorkFromHomeRequests/${empId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
          console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT',response);
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
         // const cancelled = response.filter(item => item.status === 'Cancelled');

          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          console.log('processedCount',this.waitingForApprovalWFHCount);
         // this.cancelCount=cancelled.length

          this.updateNavTabs();
        } else {
          console.error('Invalid response format');
        }
      },
      error: (reason: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT-ERROR', reason);
      }
    });
  }

updateNavTabs() {
  this.navTabs = [
    {
      label: 'Waiting For Approval',
      link: '/time-off/wfh/waiting-for-approval',
      icon: '/time-off-icon/waiting-for-approval-icon.png',
      count: this.waitingForApprovalWFHCount,
      permission: { feature: 'Waiting For Approval (WFH)', action: 'view' }
    },
    {
      label: 'Approved',
      link: '/time-off/wfh/approved',
      icon: '/time-off-icon/approved-icon.png',
      count: this.approvedWFHRequestsCount,
      permission: { feature: 'Approved (WFH)', action: 'view' }
    },
    {
      label: 'Processed',
      link: '/time-off/wfh/processed',
      icon: '/time-off-icon/processed-icon.png',
      count: this.processedWFHRequestsCount,
      permission: { feature: 'Processed (WFH)', action: 'view' }
    },
    {
      label: 'Rejected',
      link: '/time-off/wfh/rejected',
      icon: '/time-off-icon/rejected-icon.png',
      count: this.rejectedWFHRequestsCount,
      permission: { feature: 'Rejected (WFH)', action: 'view' }
    }
  ];
}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdWFH(null);
  }
}
