import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { Subject, takeUntil } from 'rxjs';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { IJob } from '../../../Interfaces/letters-model';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';

@Component({
  selector: 'app-extra-hours-reject',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    TableModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent],
  templateUrl: './extra-hours-reject.component.html',
  styleUrl: './extra-hours-reject.component.scss'
})
export class ExtraHoursRejectComponent implements OnInit, OnDestroy {
  @ViewChild('extraHoursRejectTable') extraHoursRejectTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  rejectedPerimisions: RegularizationRequest[] = [] as RegularizationRequest[];
  dataLoad = false;
  selectedYear: any;
  originalRejectedPerimisions = [] as RegularizationRequest[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService
  ) { }

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

  getDataPermissions() {
    let empId = this.empinfo.employeeId;
    this.dataLoad = true;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        this.rejectedPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Rejected'
        );

        console.log('Rejected Records:', this.rejectedPerimisions);

        this.originalRejectedPerimisions = [...this.rejectedPerimisions];
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.rejectedPerimisions = []; // Set to empty array on error
        this.originalRejectedPerimisions = [];
      },
    });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.rejectedPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Rejected'
        );
        this.originalRejectedPerimisions = [...this.rejectedPerimisions];
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.rejectedPerimisions = []; // Set to empty array on error
        this.originalRejectedPerimisions = [];
      },
    });
  }

  customSort(event: any): void {
    const field = event.field;

    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.rejectedPerimisions = [...this.originalRejectedPerimisions];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.extraHoursRejectTable) {
          this.extraHoursRejectTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle direct fields
      val1 = a[field];
      val2 = b[field];

      // Handle date sorting
      if (field === 'createdDate' || field === 'requestedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric sorting for duration
      if (field === 'duration') {
        const num1 = Number(val1) || 0;
        const num2 = Number(val2) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
