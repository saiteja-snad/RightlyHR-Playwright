import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-wfh-cancellation',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    TableModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule, InfoIconComponent],
  templateUrl: './wfh-cancellation.component.html',
  styleUrl: './wfh-cancellation.component.scss'
})

export class WfhCancellationComponent implements OnInit, OnDestroy {
  @ViewChild('wfhCancellationTable') wfhCancellationTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  rejectedWFHs: ICompOff[] = [];
  compOff = [] as any;
  rejectedWFHsCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  selectempid: any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedYear: any;
  originalRejectedWFHs = [] as ICompOff[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService) { }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdWFH$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getWFHEMPRequests();
          }
          else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getWFHRequests();
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

  getWFHRequests() {
    let empId = this.empinfo.employeeId;
    this.dataload = true;
    this.http.getFilterWFHDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.rejectedWFHs = this.compOff.filter(
          (element: { status: string }) => element.status === 'Cancelled'
        );
        this.originalRejectedWFHs = [...this.rejectedWFHs];
        this.rejectedWFHsCount = this.rejectedWFHs.length;
      },
      error: (error) => {
        this.dataload = false;
        console.error('Error fetching data:', error);
        this.rejectedWFHs = []; // Set to empty array on error
        this.originalRejectedWFHs = [];
      }, complete: () => {
        this.dataload = false;
      },
    });
  }

  // this method use when choose my team in dropdown
  getWFHEMPRequests() {
    let empId = this.selectempid;
    this.dataload = true;
    this.http.getFilterWFHDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.rejectedWFHs = this.compOff.filter(
          (element: { status: string }) => element.status === 'Cancelled'
        );
        this.originalRejectedWFHs = [...this.rejectedWFHs];
        this.rejectedWFHsCount = this.rejectedWFHs.length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.rejectedWFHs = []; // Set to empty array on error
        this.originalRejectedWFHs = [];
      }, complete: () => {
        this.dataload = false;
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
        this.rejectedWFHs = [...this.originalRejectedWFHs];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.wfhCancellationTable) {
          this.wfhCancellationTable.reset();
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
      if (field === 'startTime' || field === 'requestedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric sorting for durationType
      if (field === 'durationType') {
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