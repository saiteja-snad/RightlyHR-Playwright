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
  imports: [RouterModule, CommonModule, TabsModule],
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
  filteredTabs: any[] = [];
  cancelWFHRequestsCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService) {
    effect(() => {
      if (this.http.tirggerCountSignal().wfh || this.http.wfhTriggerSignal()) {
        this.getCompOffRequest();
        this.http.tirggerCountSignal.update((status) => ({ ...status, wfh: false }));
        this.http.wfhTriggerSignal.set(false);
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
      else {
        this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
        this.getCompOffRequest();
      }
    });
  }


  getCompOffRequest() {
    let empId = this.empinfo.employeeId;
    this.http.getData(`Timeoff/getWorkFromHomeRequests/${empId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT', response);
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          const cancelled = response.filter(item => item.status === 'Cancelled');

          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          this.cancelWFHRequestsCount = cancelled.length

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
    let empId = this.selectempid;
    this.http.getData(`Timeoff/getWorkFromHomeRequests/${empId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('getDataByLPID-LEAVE-APPROVALCOMPONENT', response);
        if (Array.isArray(response)) {
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          const cancelled = response.filter(item => item.status === 'Cancelled');

          this.waitingForApprovalWFHCount = waiting.length;
          this.approvedWFHRequestsCount = approved.length;
          this.rejectedWFHRequestsCount = rejected.length;
          this.processedWFHRequestsCount = processed.length;
          this.cancelWFHRequestsCount = cancelled.length

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

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      console.log(permissionString)
      console.log(this.rbac.allowedToAccess(permissionString))
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  updateNavTabs() {
    this.navTabs = [
      {
        label: 'Waiting For Approval',
        link: 'waiting-for-approval',
        icon: '/time-off-icon/waiting-for-approval-icon.png',
        count: this.waitingForApprovalWFHCount,
        permission: {
          feature: 'Waiting For Approval (WFH)',
          action: 'view',
        },
      },
      {
        label: 'Approved',
        link: 'approved',
        icon: '/time-off-icon/approved-icon.png',
        count: this.approvedWFHRequestsCount,
        permission: { 
          feature: 'Approved (WFH)', 
          action: 'view' 
        },
      },
      {
        label: 'Processed',
        link: 'processed',
        icon: '/time-off-icon/processed-icon.png',
        count: this.processedWFHRequestsCount,
        permission: { feature: 'Processed (WFH)', action: 'view' },
      },
      {
        label: 'Rejected',
        link: 'rejected',
        icon: '/time-off-icon/rejected-icon.png',
        count: this.rejectedWFHRequestsCount,
        permission: { feature: 'Rejected (WFH)', action: 'view' },
      },
      {
        label: 'Cancelled',
        link: 'cancelled',
        icon: '/time-off-icon/cancelled-icon.png',
        count: this.cancelWFHRequestsCount,
        permission: { feature: 'Cancel (WFH)', action: 'view' },
      },
    ];
    this.filterTabsByRbac();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdWFH(null);
  }
}
