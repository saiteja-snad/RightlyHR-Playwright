import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';

@Component({
  selector: 'app-on-behalf-of-remotelogin-cancellation',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    TableModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule, InfoIconComponent],
  templateUrl: './on-behalf-of-remotelogin-cancellation.component.html',
  styleUrl: './on-behalf-of-remotelogin-cancellation.component.scss'
})
export class OnBehalfOfRemoteloginCancellationComponent implements OnInit, OnDestroy {
  @ViewChild('remoteLoginCancellationTable') remoteLoginCancellationTable!: Table;
  remoteLoginData: ICompOff[] = [];
  originalRemoteLoginData: ICompOff[] = []; // Store original unsorted data
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private timeoffYearFilterService: TimeoffYearFilterService
  ) {
    effect(() => {
      if (this.http.onBehlafOfRemoteLoginSignal()) {
        this.http.onBehalfOfRemoteLoginSelectedEmp$.subscribe((empId: number) => {
          if (empId) {
            this.getRemoteLoginRequests(empId);
          }
        });
        this.http.onBehlafOfRemoteLoginSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.http.onBehalfOfRemoteLoginSelectedEmp$.pipe(takeUntil(this.destroy$)).subscribe((empId: number) => {
      if (empId) {
        this.getRemoteLoginRequests(empId);
      } else {
        this.remoteLoginData = [];
      }
    });

    // Listen for year changes
    this.timeoffYearFilterService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const currentEmpId = this.http.onBehalfOfRemoteLoginSelectedEmp$.value;
      if (currentEmpId) {
        this.getRemoteLoginRequests(currentEmpId);
      }
    });
  }

  getRemoteLoginRequests(employeId: number) {
    this.dataload = true;
    const selectedYear = this.timeoffYearFilterService.getSelectedYear();
    this.http.getFilterOnBehalfRemoteLoginDataByID(employeId, selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.remoteLoginData = response.filter(
          (element: { status: string }) => element.status.toLowerCase() === 'cancelled'
        );
        this.originalRemoteLoginData = [...this.remoteLoginData]; // Store original data
      },
      error: (error) => {
        this.dataload = false;
        this.remoteLoginData = [];
      },
      complete: () => {
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
        this.remoteLoginData = [...this.originalRemoteLoginData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.remoteLoginCancellationTable) {
          this.remoteLoginCancellationTable.reset();
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

      switch (field) {
        case 'startTime':
        case 'requestedDate':
          val1 = new Date(a[field]);
          val2 = new Date(b[field]);
          if (isNaN(val1.getTime())) val1 = new Date(0);
          if (isNaN(val2.getTime())) val2 = new Date(0);
          return event.order * (val1.getTime() - val2.getTime());
        case 'durationType':
          // Sort by duration type: Full Day (2), First Half (1), Second Half (3)
          const durationOrder = { 2: 'Full Day', 1: 'First Half', 3: 'Second Half' };
          val1 = durationOrder[a[field as keyof typeof durationOrder] as keyof typeof durationOrder] || '';
          val2 = durationOrder[b[field as keyof typeof durationOrder] as keyof typeof durationOrder] || '';
          return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
        default:
          // Handle string sorting for other fields
          val1 = String(a[field] ?? '').trim();
          val2 = String(b[field] ?? '').trim();
          return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
