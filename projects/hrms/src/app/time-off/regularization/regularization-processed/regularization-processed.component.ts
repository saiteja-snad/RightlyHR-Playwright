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

@Component({
  selector: 'app-regularization-processed',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, DateformatPipe],
  templateUrl: './regularization-processed.component.html',
  styleUrl: './regularization-processed.component.scss'
})
export class RegularizationProcessedComponent implements OnInit, OnDestroy {
totalRecords = 100
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  processPerimisions: RegularizationRequest [] = [] as RegularizationRequest[];

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  constructor(
    private http: HttpService
  ) {}


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getDataPermissions()
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
    this.http.getData(`RegularizationRequests/attendance/${empId}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        this.processPerimisions =response.filter((element: { status: string }) => element.status === 'Processed');
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.processPerimisions = []; // Set to empty array on error
      },
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
