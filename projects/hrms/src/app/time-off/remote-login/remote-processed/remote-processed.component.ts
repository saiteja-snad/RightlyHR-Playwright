import { CommonModule } from '@angular/common';
import { Component,effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-remote-processed',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    TranslateModule,
    InfoIconComponent,
    TableModule,
    DateformatPipe, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './remote-processed.component.html',
  styleUrl: './remote-processed.component.scss'
})
export class RemoteProcessedComponent implements OnInit,OnDestroy {
  @ViewChild('remoteProcessedTable') remoteProcessedTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  approvedRemotes: ICompOff[] = [];
  remoteLogin = [] as any;
  approvedRemotesCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataLoad = false;

  // Sorting properties
  originalApprovedRemotes = [] as ICompOff[];
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedYear: any;
  selectempid: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    public rbac: RbacService,
    private TimeoffYearFilterService: TimeoffYearFilterService
  ) {
         // Signal reaction for employee switch
         effect(() =>{
          if (this.http.tirggerCountSignal().remote) {
            this.getRemoteRequests();
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              remote: false,
            }));
          }
    
      })
  }

  ngOnInit(): void {
    // this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    // this.getRemoteRequests();

    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRemoteLogin$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getRemoteLoginEMPRequests();
          } else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getRemoteRequests();
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

  getRemoteRequests() {
    let empId = this.empinfo.employeeId;
    this.dataLoad = true;
    this.http
      .getFilterRemoteLoginDataByID(
      empId,this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.dataLoad = false;
          this.remoteLogin = response;
          this.approvedRemotes = this.remoteLogin.filter(
            (element: { status: string }) => element.status === 'Processed'
          );
          this.originalApprovedRemotes = [...this.approvedRemotes]; // Store original data
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          this.dataLoad = false;
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
          this.originalApprovedRemotes = [];
        },
      });
  }


  getRemoteLoginEMPRequests() {
    let empId = this.selectempid;
    this.http
      .getFilterRemoteLoginDataByID(
        empId,this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.remoteLogin = response;
          this.approvedRemotes = this.remoteLogin.filter(
            (element: { status: string }) => element.status === 'Processed'
          );
          this.originalApprovedRemotes = [...this.approvedRemotes]; // Store original data
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
          this.originalApprovedRemotes = [];
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
        this.approvedRemotes = [...this.originalApprovedRemotes];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.remoteProcessedTable) {
          this.remoteProcessedTable.reset();
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

      // Handle different field types
      switch (field) {
        case 'startTime':
        case 'requestedDate':
        case 'processedDate':
          val1 = new Date(a[field]).getTime();
          val2 = new Date(b[field]).getTime();
          return event.order * (val1 - val2);
        
        case 'durationType':
          // Map durationType numbers to sortable values
          const durationMap: { [key: number]: string } = {
            1: 'First Half',
            2: 'Full Day', 
            3: 'Second Half'
          };
          val1 = durationMap[a[field]] || '';
          val2 = durationMap[b[field]] || '';
          break;
        
        case 'status':
        case 'requestedComments':
        case 'approverComments':
        default:
          val1 = a[field];
          val2 = b[field];
          break;
      }

      // Handle string sorting for non-date fields
      if (field !== 'startTime' && field !== 'requestedDate' && field !== 'processedDate') {
        val1 = String(val1 ?? '').trim();
        val2 = String(val2 ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }

      return 0; // Fallback
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
