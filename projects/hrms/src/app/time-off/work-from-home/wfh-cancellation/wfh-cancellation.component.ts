import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-wfh-cancellation',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule, InfoIconComponent],
  templateUrl: './wfh-cancellation.component.html',
  styleUrl: './wfh-cancellation.component.scss'
})
export class WfhCancellationComponent implements OnInit,OnDestroy {
totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  rejectedWFHs: ICompOff[] = [];
  compOff = [] as any;
  rejectedWFHsCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  selectempid: any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    public rbac: RbacService,
  ) {
    
  }

  ngOnInit(): void {
    this.http.selectedEmployeeIdWFH$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getWFHEMPRequests();
      }
      else{
          this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo);
    this.getWFHRequests();
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

  getWFHRequests() {
    let empId = this.empinfo.employeeId;
    console.log(empId);
    this.dataload = true; 
    this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.rejectedWFHs = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Cancelled'
          );
          this.rejectedWFHsCount = this.rejectedWFHs.length;
        },
        error: (error) => {
          this.dataload = false;
          console.error('Error fetching data:', error);
          this.rejectedWFHs = []; // Set to empty array on error
        },complete: () =>{
          this.dataload = false;
        },
      });
  }
  // this method use when choose my team in dropdown
  getWFHEMPRequests() {
    let empId = this.selectempid;
    console.log(empId);
    this.dataload = true; 
    this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.rejectedWFHs = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Cancelled'
          );
          this.rejectedWFHsCount = this.rejectedWFHs.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.rejectedWFHs = []; // Set to empty array on error
        },complete: () =>{
          this.dataload = false;
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
