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
  selector: 'app-on-behalf-of-remotelogin-cancellation',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule, InfoIconComponent],
  templateUrl: './on-behalf-of-remotelogin-cancellation.component.html',
  styleUrl: './on-behalf-of-remotelogin-cancellation.component.scss'
})
export class OnBehalfOfRemoteloginCancellationComponent {
  remoteLoginData: ICompOff[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;

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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
