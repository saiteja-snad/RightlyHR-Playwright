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
  navTabs: any[] = [
    { label: 'Waiting For Approval', link: 'waiting-for-approval', count:this.waitingForApprovalWFHCount,permission: { feature: 'Waiting For Approval (WFH)', action: 'view' } },
    { label: 'Approved', link: 'approved', count: this.approvedWFHRequestsCount,permission: { feature: 'Approved (WFH)', action: 'view' } },
    { label: 'Processed', link: 'processed', count: this.processedWFHRequestsCount,permission: { feature: 'Processed (WFH)', action: 'view' } },
    { label: 'Rejected', link: 'rejected', count: this.rejectedWFHRequestsCount,permission: { feature: 'Rejected (WFH)', action: 'view' } },
  ];
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
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCompOffRequest();
  }

  getCompOffRequest() {
    let empId = this.empinfo.employeeId;
    this.http.getData(`Timeoff/getWorkFromHomeRequests/${empId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.waitingForApprovalWFHCount = this.compOff.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        this.approvedWFHRequestsCount = this.compOff.filter(
          (element: { status: string }) => element.status === 'Approved'
        ).length;
        this.rejectedWFHRequestsCount = this.compOff.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.processedWFHRequestsCount = this.compOff.filter(
          (element: { status: string }) => element.status === 'Processed'
        ).length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.compOff = []; // Set to empty array on error
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
