import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-comp-off-waiting-for-approval',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './comp-off-waiting-for-approval.component.html',
  styleUrl: './comp-off-waiting-for-approval.component.scss'
})

export class CompOffWaitingForApprovalComponent implements OnInit, OnDestroy {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  waitingForApprovalCompOff: ICompOff[] = [];
  compOff = [] as any;
  waitingForApprovalCompOffCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  constructor(private http: HttpService, public rbac: RbacService,) {
    effect(() => {
      if (this.http.tirggerCountSignal().compOff) {
        this.getCompOffRequest();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          compOff: false,
        }));
      }
    })
  }

  ngOnInit(): void {
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
    let empId = this.empinfo.employeeId;
    this.http.getData(`Timeoff/getCompoffRequests/${empId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.waitingForApprovalCompOff = this.compOff.filter((element: { status: string }) => element.status === 'Waiting for Approval');
        this.waitingForApprovalCompOffCount = this.waitingForApprovalCompOff.length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.waitingForApprovalCompOff = []; // Set to empty array on error
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}