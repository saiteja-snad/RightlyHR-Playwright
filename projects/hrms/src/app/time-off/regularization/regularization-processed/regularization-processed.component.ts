import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-regularization-processed',
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
    InfoIconComponent
  ],
  templateUrl: './regularization-processed.component.html',
  styleUrl: './regularization-processed.component.scss',
})
export class RegularizationProcessedComponent implements OnInit, OnDestroy {
  @ViewChild('regularizationProcessedTable') regularizationProcessedTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  selectempid: any;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  processPerimisions: RegularizationRequest[] = [] as RegularizationRequest[];
  dataLoad = false;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedYear: any;
  originalProcessPerimisions = [] as RegularizationRequest[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, public rbac: RbacService,private TimeoffYearFilterService: TimeoffYearFilterService) { }

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
        this.processPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Processed'
        );
        this.originalProcessPerimisions = [...this.processPerimisions];
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.processPerimisions = []; // Set to empty array on error
        this.originalProcessPerimisions = [];
      },
    });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http.getFilterRegularizationDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.processPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Processed'
        );
        this.originalProcessPerimisions = [...this.processPerimisions];
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.processPerimisions = []; // Set to empty array on error
        this.originalProcessPerimisions = [];
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
        this.processPerimisions = [...this.originalProcessPerimisions];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.regularizationProcessedTable) {
          this.regularizationProcessedTable.reset();
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
