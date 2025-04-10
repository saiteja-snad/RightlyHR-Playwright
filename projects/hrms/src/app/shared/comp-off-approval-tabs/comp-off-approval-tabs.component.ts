import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ICompOff } from '../../Interfaces/compoff.modal';
import { IJob } from '../../Interfaces/letters-model';
import { HttpService } from '../../services/http.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-comp-off-approval-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './comp-off-approval-tabs.component.html',
  styleUrl: './comp-off-approval-tabs.component.scss',
})
export class CompOffApprovalTabsComponent implements OnInit, OnDestroy {
  compOff = [] as any;
  rejectedCompOffRequestsCount = 0;
  waitingForApprovalCompOffCount = 0;
  approvalCompOffRequestsCount = 0;
  processedCompOffRequestsCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public readonly router: Router, private http: HttpService) {
    effect(() =>{
        if (this.http.tirggerCountSignal().compOff) {
          this.getCompOffRequest();
          this.http.tirggerCountSignal.update((status) => ({
            ...status,
            compOff: false,
          }));
        }

    })
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
      .getData(`Timeoff/getCompoffRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.waitingForApprovalCompOffCount = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          ).length;
          this.approvalCompOffRequestsCount = this.compOff.filter(
            (element: { status: string }) => element.status === 'Approved'
          ).length;
          this.rejectedCompOffRequestsCount = this.compOff.filter(
            (element: { status: string }) => element.status === 'Rejected'
          ).length;
          this.processedCompOffRequestsCount = this.compOff.filter(
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
