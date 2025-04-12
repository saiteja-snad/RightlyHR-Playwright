import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ICompOff } from '../../interfaces/compoff.modal';
import { IJob } from '../../interfaces/letters-model';
import { HttpService } from '../../services/http.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-wfh-approvaltabs',
  imports: [RouterModule],
  templateUrl: './wfh-approvaltabs.component.html',
  styleUrl: './wfh-approvaltabs.component.scss',
})
export class WfhApprovaltabsComponent implements OnInit, OnDestroy {
  compOff = [] as any;
  rejectedWFHRequestsCount = 0;
  waitingForApprovalWFHCount = 0;
  approvedWFHRequestsCount = 0;
  processedWFHRequestsCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public readonly router: Router, private http: HttpService) {
    effect(() => {
      if (this.http.tirggerCountSignal().wfh) {
        this.getCompOffRequest();
      this.http
        .tirggerCountSignal
        .update((status) => ({ ...status, wfh: false }));
      }

 
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCompOffRequest();
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getCompOffRequest() {
    let empId = this.empinfo.employeeId;
    console.log(empId);
    this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.waitingForApprovalWFHCount = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
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
