import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-leaves-rejected',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule,
    DateformatPipe, NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent],
  templateUrl: './leaves-rejected.component.html',
  styleUrl: './leaves-rejected.component.scss'
})

export class LeavesRejectedComponent implements OnInit, OnDestroy{
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  selectempid = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  loading: boolean = false;
  selectedSandwichItem: any = null;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  selectedYear: any;

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.TimeoffYearFilterService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdTimeoff$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getDataByEMPLPID();
          } else {
            this.loggedinuser = this.authService.getToken();
            this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
            this.getDataByLPID();
          }
        });
      }
    })
  }

  getDataByLPID() {
    this.loading = true;
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Rejected');
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getDataByEMPLPID() {
    this.loading = true;
    let empid = this.selectempid;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Rejected');
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openSandwichBreakdown(item: any, modal: any) {
    this.selectedSandwichItem = item;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}