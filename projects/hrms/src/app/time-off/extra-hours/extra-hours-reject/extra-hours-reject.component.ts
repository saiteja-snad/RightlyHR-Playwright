import { Component } from '@angular/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { Subject, takeUntil } from 'rxjs';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
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
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';

@Component({
  selector: 'app-extra-hours-reject',
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
    InfoIconComponent],
  templateUrl: './extra-hours-reject.component.html',
  styleUrl: './extra-hours-reject.component.scss'
})
export class ExtraHoursRejectComponent {
  otalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  rejectedPerimisions: RegularizationRequest[] = [] as RegularizationRequest[];
  dataLoad = false;
  selectedYear: any;

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
        this.rejectedPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Rejected'
        );
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.rejectedPerimisions = []; // Set to empty array on error
      },
    });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http.getFilterRegularizationDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.rejectedPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Rejected'
        );
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.rejectedPerimisions = []; // Set to empty array on error
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
