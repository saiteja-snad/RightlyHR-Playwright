import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-regularization-processed',
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
    InfoIconComponent
],
  templateUrl: './regularization-processed.component.html',
  styleUrl: './regularization-processed.component.scss',
})
export class RegularizationProcessedComponent implements OnInit, OnDestroy {
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

  constructor(private http: HttpService, public rbac: RbacService) {}

  ngOnInit(): void {
    this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getDataEMPPermissions();
      } else {
        this.empinfo = JSON.parse(
          localStorage.getItem('rightlyHrUser') ?? '{}'
        );
        this.getDataPermissions();
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
    this.http
      .getData(`RegularizationRequests/attendance/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.processPerimisions = response.filter(
            (element: { status: string }) => element.status === 'Processed'
          );
          this.dataLoad = false;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.dataLoad = false;
          this.processPerimisions = []; // Set to empty array on error
        },
      });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http
      .getData(`RegularizationRequests/attendance/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.processPerimisions = response.filter(
            (element: { status: string }) => element.status === 'Processed'
          );
          this.dataLoad = false;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.dataLoad = false;
          this.processPerimisions = []; // Set to empty array on error
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
