import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule,  } from '@angular/forms';
import { NgbPopoverModule,  } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';

@Component({
  selector: 'app-remote-waiting-for-approval',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    TranslateModule,
    NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './remote-waiting-for-approval.component.html',
  styleUrl: './remote-waiting-for-approval.component.scss'
})
export class RemoteWaitingForApprovalComponent implements OnInit,OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  approvedRemotes: ICompOff[] = [];
  remoteLogin = [] as any;
  approvedRemotesCount = 0;
  empinfo = {} as IJob;
  dataLoad = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectempid: any;
  selectedYear: any;

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private signalService:SignalsService,
    private TimeoffYearFilterService: TimeoffYearFilterService
  ) {
     effect(() =>{
      if (this.signalService.remoteLoginRequestTriggerSignal()) {
        this.getRemoteRequests();
        this.signalService.remoteLoginRequestTriggerSignal.set(false);
      }

  })
  }

  ngOnInit(): void {
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
        empId,
        this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.remoteLogin = response;
          this.dataLoad = false;
          this.approvedRemotes = this.remoteLogin?.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          );
        },
        error: (error) => {
          this.dataLoad = false;
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
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
            (element: { status: string }) => element.status === 'Waiting for Approval'
          );
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
