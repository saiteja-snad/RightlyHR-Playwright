import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { CommonModule } from '@angular/common';
import { SidetabsloadersComponent } from '../../sidetabsloaders/sidetabsloaders.component';
@Component({
  selector: 'app-remotelogin-approval-tabs',
    imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './remotelogin-approval-tabs.component.html',
  styleUrl: './remotelogin-approval-tabs.component.scss'
})
export class RemoteloginApprovalTabsComponent implements OnInit, OnDestroy {
  compOff = [] as any;
  rejectedCompOffRequestsCount = 0;
  waitingForApprovalCompOffCount = 0;
  approvalCompOffRequestsCount = 0;
  processedCompOffRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  loading = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedYear: any;

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService) {
    effect(() => {
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
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.selectempid = '';
        this.http.selectedEmployeeIdCompOff$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getCompOffEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getCompOffRequest();
          }
        });
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getCompOffRequest() {
    this.loading=true
    let empId = this.empinfo.employeeId;
    this.http.getFilterCompoffDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading=false
        this.compOff = response;
        this.waitingForApprovalCompOffCount = this.compOff.filter((element: { status: string }) => element.status === 'Waiting for Approval').length;
        this.approvalCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Approved').length;
        this.rejectedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Rejected').length;
        this.processedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Processed').length;
      },
      error: (error) => {
        this.loading=false
        console.error('Error fetching data:', error);
        this.compOff = []; // Set to empty array on error
      },
    });
  }

  getCompOffEMPRequest() {
    let empId = this.selectempid;
    this.http.getFilterCompoffDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.waitingForApprovalCompOffCount = this.compOff.filter((element: { status: string }) => element.status === 'Waiting for Approval').length;
        this.approvalCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Approved').length;
        this.rejectedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Rejected').length;
        this.processedCompOffRequestsCount = this.compOff.filter((element: { status: string }) => element.status === 'Processed').length;
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
    this.http.setEmployeeIdCompOff(null);
  }
}