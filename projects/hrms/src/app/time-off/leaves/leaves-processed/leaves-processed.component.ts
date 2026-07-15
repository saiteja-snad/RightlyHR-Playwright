import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-leaves-processed',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, TableModule, DateformatPipe,
    NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent],
  templateUrl: './leaves-processed.component.html',
  styleUrl: './leaves-processed.component.scss'
})

export class LeavesProcessedComponent implements OnInit, OnDestroy{
  @ViewChild('leavesProcessedTable') leavesProcessedTable!: Table;
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  selectempid = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  originalLpdata = [] as Ilpid[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  loading: boolean = false;
  selectedSandwichItem: any = null;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  selectedYear: any;

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal) { }

  ngOnInit(): void {
    // this.loggedinuser = this.authService.getToken();
    // this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    // this.getDataByLPID();
    this.TimeoffYearFilterService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdTimeoff$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getDataByEMPLPID();
          } else {
            this.loggedinuser = this.authService.getToken();
            this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
            this.getDataByLPID();
          }
        });
      }
    })
  }

  getDataByLPID() {
    this.loading = true;
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Processed');
          this.originalLpdata = [...this.lpdata]; // Store original unsorted data
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => {
        console.log(reason)
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }

  getDataByEMPLPID() {
    let empid = this.selectempid;
    this.loading = true;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Processed');
          this.originalLpdata = [...this.lpdata]; // Store original unsorted data
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
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
        this.lpdata = [...this.originalLpdata];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.leavesProcessedTable) {
          this.leavesProcessedTable.reset();
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

      if (field === 'date' || field === 'startdate' || field === 'enddate') {
        // Handle date sorting
        val1 = new Date(a[field]);
        val2 = new Date(b[field]);
        return event.order * (val1.getTime() - val2.getTime());
      } else if (field === 'duration') {
        // Handle numeric sorting
        val1 = parseFloat(a[field]) || 0;
        val2 = parseFloat(b[field]) || 0;
        return event.order * (val1 - val2);
      } else {
        // Handle string sorting for all other fields
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  openSandwichBreakdown(item: any, modal: any) {
    this.selectedSandwichItem = item;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}