 import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import {  FormsModule } from '@angular/forms';
import {  NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-wfh-waiting-for-approval',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './wfh-waiting-for-approval.component.html',
  styleUrl: './wfh-waiting-for-approval.component.scss'
})
export class WfhWaitingForApprovalComponent implements OnInit,OnDestroy {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  waitingForApprovalWFHs:ICompOff[]=[] ;
  compOff = [] as any;
  waitingForApprovalWFHCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];




  constructor(
    private http: HttpService,
    public rbac: RbacService,
  ) {
    effect(() => {
      if (this.http.wfhTriggerSignal()) {
        this.getWFHRequests();
      this.http.wfhTriggerSignal.set(false);
      }
    });
  }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo);
    this.getWFHRequests();
 
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
    this.dataload = true;
    console.log(empId);
    this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.waitingForApprovalWFHs = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          );
          this.waitingForApprovalWFHCount = this.waitingForApprovalWFHs.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.waitingForApprovalWFHs = [];
        },complete: () => {
          this.dataload = false;
          
        },
      });
  }


  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
