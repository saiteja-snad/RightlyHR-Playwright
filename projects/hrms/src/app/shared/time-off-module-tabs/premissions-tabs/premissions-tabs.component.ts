import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-premissions-tabs',
  imports: [CommonModule, RouterModule, SidetabsloadersComponent],
  templateUrl: './premissions-tabs.component.html',
  styleUrl: './premissions-tabs.component.scss'
})

export class PremissionsTabsComponent implements OnInit, OnDestroy {
  wfh = [] as any;
  rejectedPermissionsRequestsCount = 0;
  waitingForApprovalPermissionsCount = 0;
  approvalPermissionsRequestsCount = 0;
  cancelPermissionsRequestsCount = 0;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  loadiing = false;
  selectedYear: any;

  constructor(public readonly router: Router, private http: HttpService, public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService) {
    effect(() => {
  if (this.http.permissionTriggerSignal()) {

    console.log('Tabs Signal Fired');
    console.log('selectempid:', this.selectempid);

    if (this.selectempid) {
      this.getPermissionEMPRequest();
    } else {
      this.getPermissionRequest();
    }
  }
});
  }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdPermission$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getPermissionEMPRequest();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getPermissionRequest();
          }
        });
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getPermissionRequest() {
    this.loadiing = true
    let empId = this.empinfo.employeeId;
    this.http.getFilterPermissionDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfh = response;
        this.waitingForApprovalPermissionsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        this.approvalPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Processed' || element.status === 'Approved'
        ).length;
        this.rejectedPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.cancelPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Cancelled'
        ).length;
        this.loadiing = false
      },
      error: (error) => {
        this.loadiing = false
        console.error('Error fetching data:', error);
        this.wfh = []; // Set to empty array on error
      },
    });
  }

  getPermissionEMPRequest() {
    console.log('Loading employee permissions for:', this.selectempid);

    let empId = this.selectempid;
    this.http.getFilterPermissionDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfh = response;
        this.waitingForApprovalPermissionsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        ).length;
        this.approvalPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Processed' || element.status === 'Approved'
        ).length;
        this.rejectedPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Rejected'
        ).length;
        this.cancelPermissionsRequestsCount = this.wfh.filter(
          (element: { status: string }) => element.status === 'Cancelled'
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
    this.http.setEmployeeIdPermission(null);
  }
}