import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { IJob } from '../../../Interfaces/letters-model';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';

@Component({
  selector: 'app-extra-hours-waiting-for-approval',
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
    InfoIconComponent
  ],
  templateUrl: './extra-hours-waiting-for-approval.component.html',
  styleUrl: './extra-hours-waiting-for-approval.component.scss'
})
export class ExtraHoursWaitingForApprovalComponent {
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
  selectedYear: any;

  constructor(private http: HttpService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService) {
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
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getDataEMPPermissions();
          } else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getDataPermissions();
          }
        });
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
    this.http.getFilterRegularizationDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.waitingForApprovalPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
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
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.waitingForApprovalPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
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
