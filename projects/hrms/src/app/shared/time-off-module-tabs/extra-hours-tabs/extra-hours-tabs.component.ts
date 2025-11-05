import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-extra-hours-tabs',
 imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './extra-hours-tabs.component.html',
  styleUrl: './extra-hours-tabs.component.scss'
})
export class ExtraHoursTabsComponent implements OnInit, OnDestroy {
  rejectedregularizationRequestsCount = 0;
  waitingForApprovalregularizationCount = 0;
  approvalregularizationRequestsCount = 0;
  processregularizationRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  regularization = [] as any;
  loading = false;
  selectedYear: any;

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
     private TimeoffYearFilterService: TimeoffYearFilterService) {
    effect(() => {
      if (this.http.tirggerCountSignal().compOff) {
        this.getRequests();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          compOff: false,
        }));
      }
    })
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getRequestsEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getRequests();
          }
        });
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getRequests() {
    this.loading = true;
    let empId = this.empinfo.employeeId;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.regularization = response;
        this.waitingForApprovalregularizationCount = this.regularization.filter(
          (element: { status: string }) =>  element.status === 'Waiting for Approval'
        ).length;
        // this.approvalregularizationRequestsCount = this.regularization.filter(
        //   (element: { status: string }) => element.status === 'Approved'
        // ).length;
        this.rejectedregularizationRequestsCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.processregularizationRequestsCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Processed'
        ).length;
        this.loading = false
      },
      error: (error) => {
        this.loading = false
        console.error('Error fetching data:', error);
        this.regularization = []; // Set to empty array on error
      },
    });
  }

  getRequestsEMPRequest() {
    let empId = this.selectempid;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.regularization = response;
        this.waitingForApprovalregularizationCount = this.regularization.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        // this.approvalregularizationRequestsCount = this.regularization.filter(
        //   (element: { status: string }) => element.status === 'Approved'
        // ).length;
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
    this.http.setEmployeeIdRegularization(null);
  }
}