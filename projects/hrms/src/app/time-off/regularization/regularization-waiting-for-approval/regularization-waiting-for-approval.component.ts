import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { IJob } from '../../../Interfaces/job-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-regularization-waiting-for-approval',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    TranslateModule,
  ],
  templateUrl: './regularization-waiting-for-approval.component.html',
  styleUrl: './regularization-waiting-for-approval.component.scss',
})
export class RegularizationWaitingForApprovalComponent
  implements OnInit, OnDestroy
{
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  waitingForApprovalPerimisions: RegularizationRequest[] =
    [] as RegularizationRequest[];
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  dataLoad = false;
  constructor(private http: HttpService, public rbac: RbacService) {
    effect(() => {
      if (this.http.tirggerCountSignal().permission) {
        this.getDataPermissions();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          permission: false,
        }));
      }
    });
  }

  ngOnInit(): void {
    this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getDataEMPPermissions();
      } else {
        this.empinfo = JSON.parse(
          localStorage.getItem('rightlyHrUser') ?? '{}'
        );
        this.getDataPermissions();
      }
    });
  }
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getDataPermissions() {
    let empId = this.empinfo.employeeId;
    this.dataLoad = true;
    this.http
      .getData(`RegularizationRequests/attendance/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.waitingForApprovalPerimisions = response.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          );
          this.dataLoad = false;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.dataLoad = false;
          this.waitingForApprovalPerimisions = []; // Set to empty array on error
        },
      });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http
      .getData(`RegularizationRequests/attendance/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.waitingForApprovalPerimisions = response.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          );
          this.dataLoad = false;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.dataLoad = false;
          this.waitingForApprovalPerimisions = []; // Set to empty array on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
