import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
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
  selector: 'app-on-behalf-of-whf-approved',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent],
  templateUrl: './on-behalf-of-whf-approved.component.html',
  styleUrl: './on-behalf-of-whf-approved.component.scss'
})
export class OnBehalfOfWhfApprovedComponent implements OnInit, OnDestroy {
  wfhData: ICompOff[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private timeoffYearFilterService: TimeoffYearFilterService
  ) {
    effect(() => {
      if (this.http.onBehlafOfWFHSignal()) {
        const currentEmpId = this.http.onBehalfOfWFHSelectedEmp$.value;
        if (currentEmpId) {
          this.getWFHRequests(currentEmpId);
        }
        this.http.onBehlafOfWFHSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.http.onBehalfOfWFHSelectedEmp$.pipe(takeUntil(this.destroy$)).subscribe((empId: number) => {
      if (empId) {
        this.getWFHRequests(empId);
      } else {
        this.wfhData = [];
      }
    });

    // Listen for year changes
    this.timeoffYearFilterService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const currentEmpId = this.http.onBehalfOfWFHSelectedEmp$.value;
      if (currentEmpId) {
        this.getWFHRequests(currentEmpId);
      }
    });
  }

  getWFHRequests(employeId: number) {
    this.dataload = true;
    const selectedYear = this.timeoffYearFilterService.getSelectedYear();
    this.http.getFilterOnBehalfWFHDataByID(employeId, selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfhData = response.filter(
          (element: { status: string }) => element.status.toLowerCase() === 'approved'
        );
      },
      error: (error) => {
        this.dataload = false;
        this.wfhData = [];
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
