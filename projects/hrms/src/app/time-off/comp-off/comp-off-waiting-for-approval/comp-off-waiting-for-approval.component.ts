import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";

@Component({
  selector: 'app-comp-off-waiting-for-approval',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe],
  templateUrl: './comp-off-waiting-for-approval.component.html',
  styleUrl: './comp-off-waiting-for-approval.component.scss'
})
export class CompOffWaitingForApprovalComponent  implements OnInit,OnDestroy {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  waitingForApprovalCompOff:ICompOff[]=[] ;
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




  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService
  ) {}


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo);
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
    console.log(empId);
    this.http.getData(`Timeoff/getCompoffRequests/${empId}`) 
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        console.log(response);
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
