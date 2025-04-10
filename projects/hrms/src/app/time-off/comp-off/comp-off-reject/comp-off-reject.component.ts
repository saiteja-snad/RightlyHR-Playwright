import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-comp-off-reject',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe],
  templateUrl: './comp-off-reject.component.html',
  styleUrl: './comp-off-reject.component.scss'
})
export class CompOffRejectComponent  implements OnInit,OnDestroy {

  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  rejectedCompOffRequests:ICompOff[]=[] ;
  compOff = [] as any;
  rejectedCompOffRequestsCount = 0;
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
        this.compOff = response;
        this.rejectedCompOffRequests = this.compOff.filter((element: { status: string }) => element.status === 'Rejected');
        this.rejectedCompOffRequestsCount = this.rejectedCompOffRequests.length;
      },
      error: (error) => {
        console.error('Error fetching rides:', error);
        this.rejectedCompOffRequests = []; // Set to empty array on error
      },
    });
  }


  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
