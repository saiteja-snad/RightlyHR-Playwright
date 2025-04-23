import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-comp-off-process',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './comp-off-process.component.html',
  styleUrl: './comp-off-process.component.scss'
})
export class CompOffProcessComponent implements OnInit,OnDestroy {

  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  processedCompOffRequests:ICompOff[]=[] ;
  compOff = [] as any;
  processedCompOffRequestsCount = 0;
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
    private http: HttpService,
    public rbac: RbacService,
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
    this.http.getData(`Timeoff/getCompoffRequests/${empId}`) 
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        this.compOff = response;
        this.processedCompOffRequests = this.compOff.filter((element: { status: string }) => element.status === 'Processed');
        this.processedCompOffRequestsCount = this.processedCompOffRequests.length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.processedCompOffRequests = []; // Set to empty array on error
      },
    });
  }


  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
