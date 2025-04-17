import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../Interfaces/job-model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-regularization-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './regularization-tabs.component.html',
  styleUrl: './regularization-tabs.component.scss'
})
export class RegularizationTabsComponent implements OnInit,OnDestroy {
  rejectedregularizationRequestsCount = 0;
  waitingForApprovalregularizationCount = 0;
  approvalregularizationRequestsCount = 0;
  processregularizationRequestsCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  regularization=[] as any;
  constructor(public readonly router: Router, private http: HttpService) {
    effect(() =>{
        if (this.http.tirggerCountSignal().compOff) {
          this.getregularizationRequest();
          this.http.tirggerCountSignal.update((status) => ({
            ...status,
            compOff: false,
          }));
        }

    })
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getregularizationRequest();
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getregularizationRequest() {
    let empId = this.empinfo.employeeId;
    console.log(empId);
    this.http
      .getData(`RegularizationRequests/attendance/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.regularization = response;
          this.waitingForApprovalregularizationCount = this.regularization.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          ).length;
          this.approvalregularizationRequestsCount = this.regularization.filter(
            (element: { status: string }) => element.status === 'Approved'
          ).length;
          this.rejectedregularizationRequestsCount = this.regularization.filter(
            (element: { status: string }) => element.status === 'Rejected'
          ).length;
          this.processregularizationRequestsCount = this.regularization.filter(
            (element: { status: string }) => element.status === 'Processed'
          ).length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.regularization = []; // Set to empty array on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
