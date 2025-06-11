import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-comp-off-approval',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent
],
  templateUrl: './comp-off-approval.component.html',
  styleUrl: './comp-off-approval.component.scss',
})
export class CompOffApprovalComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  approvalCompOffRequests: ICompOff[] = [];
  compOff = [] as any;
  approvalCompOffRequestsCount = 0;
  empinfo = {} as IJob;
  selectemp: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  constructor(private http: HttpService, public rbac: RbacService) {}

  ngOnInit(): void {
    this.http.selectedEmployeeIdCompOff$.subscribe((id) => {
      if (id) {
        this.selectemp = id;
        this.getCompOffRequest();
      }else{
         this.getCompOffRequest();
      }
    });
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getCompOffRequest();
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getCompOffRequest() {
    // let empId = this.empinfo.employeeId || this.selectemp;
   let empId = this.selectemp ?? this.empinfo.employeeId;
    this.dataload = true;
    this.http.getData(`Timeoff/getCompoffRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.compOff = response;
          this.approvalCompOffRequests = this.compOff.filter(
            (element: { status: string }) => element.status === 'Approved'
          );
          this.approvalCompOffRequestsCount = this.approvalCompOffRequests.length;
        },
        error: (error) => {
          this.dataload = false;
          this.approvalCompOffRequestsCount= 0;
          this.approvalCompOffRequests = [];
          console.error('Error fetching data:', error);
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