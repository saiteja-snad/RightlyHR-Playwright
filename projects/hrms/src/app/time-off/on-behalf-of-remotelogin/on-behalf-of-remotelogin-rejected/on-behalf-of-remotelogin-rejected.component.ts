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
  selector: 'app-on-behalf-of-remotelogin-rejected',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    TableModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent],
  templateUrl: './on-behalf-of-remotelogin-rejected.component.html',
  styleUrl: './on-behalf-of-remotelogin-rejected.component.scss'
})
export class OnBehalfOfRemoteloginRejectedComponent implements OnInit, OnDestroy {
@ViewChild('remoteLoginRejectedTable') remoteLoginRejectedTable!: Table;
remoteLoginData: ICompOff[] = [];
originalRemoteLoginData: ICompOff[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  currentSortField: string = '';
  currentSortOrder: number = 0;

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
          (element: { status: string }) => element.status.toLowerCase() === 'rejected'
        );
        this.originalRemoteLoginData = [...this.remoteLoginData];
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
        if (this.remoteLoginRejectedTable) {
          this.remoteLoginRejectedTable.reset();
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

      // Handle date fields
      if (['startTime', 'requestedDate'].includes(field)) {
        val1 = new Date(a[field]);
        val2 = new Date(b[field]);
        return event.order * (val1.getTime() - val2.getTime());
      }

      // Handle durationType
      if (field === 'durationType') {
        const typeMap: { [key: number]: string } = {
          1: 'First Half',
          2: 'Full Day',
          3: 'Second Half'
        };
        val1 = typeMap[a[field]] || 'Unknown';
        val2 = typeMap[b[field]] || 'Unknown';
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle string sorting for all other fields
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
