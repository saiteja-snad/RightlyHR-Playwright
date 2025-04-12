import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../Interfaces/letters-model';
import { HttpService } from '../../services/http.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-premissions-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './premissions-tabs.component.html',
  styleUrl: './premissions-tabs.component.scss'
})
export class PremissionsTabsComponent implements OnInit, OnDestroy {
  wfh = [] as any;
  rejectedPermissionsRequestsCount = 0;
  waitingForApprovalPermissionsCount = 0;
  approvalPermissionsRequestsCount = 0;
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
      .getData(`RegularizationRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.wfh = response;
          this.waitingForApprovalPermissionsCount = this.wfh.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          ).length;
          this.approvalPermissionsRequestsCount = this.wfh.filter(
            (element: { status: string }) => element.status === 'Approved'
          ).length;
          this.rejectedPermissionsRequestsCount = this.wfh.filter(
            (element: { status: string }) => element.status === 'Rejected'
          ).length;
  
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.wfh = []; // Set to empty array on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
