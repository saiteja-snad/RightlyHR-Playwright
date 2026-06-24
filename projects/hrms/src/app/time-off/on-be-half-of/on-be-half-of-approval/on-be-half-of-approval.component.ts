import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RbacService } from '../../../services/rbac.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-on-be-half-of-approval',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, TranslateModule, FormsModule, PaginatorModule, DropdownModule, TableModule, DateformatPipe, NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent],
  templateUrl: './on-be-half-of-approval.component.html',
  styleUrl: './on-be-half-of-approval.component.scss'
})

export class OnBeHalfOfApprovalComponent implements OnInit, OnDestroy{
  @ViewChild('approvalTable') approvalTable!: Table;
  loggedinuser = {} as any;
  cadidateEmployeeId!:number;
  subscription!: Subscription;
  approvedLeaves: any = [];
  originalApprovedLeaves: any = [];
  selectedSandwichItem: any = null;
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loading: boolean = false;
  currentSortField: string = '';
  currentSortOrder: number = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService, private timeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal) {
    effect(() => {
      if (this.http.onBehalfOfTriggerSignal() > 0) {
        this.cadidateEmployeeId = parseInt(
          localStorage.getItem('onbehalfof') as string
        );
        if (!isNaN(this.cadidateEmployeeId)) {
          this.getDataByLPID();
        } else {
          this.approvedLeaves = [];
        }
      }
    });
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.cadidateEmployeeId =parseInt(localStorage.getItem('onbehalfof') as string) ;
    if(this.cadidateEmployeeId){
      this.getDataByLPID();
    }
  }

  getDataByLPID() {
    this.loading = true;
    const selectedYear = this.timeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}?year=${selectedYear}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log(response)
        if (Array.isArray(response)) {
          this.approvedLeaves = response.filter(item => item.status.toLowerCase() === 'approved');
          this.originalApprovedLeaves = [...this.approvedLeaves];
          let pendingCount = this.approvedLeaves.length;
        } else {
          console.error("Invalid response format");

        }
      },
      error: (reason: any) =>{ console.log(reason)
        this.loading = false;
        this.approvedLeaves = [];
        console.error("Error fetching data:", reason);
      }
    });
  }

  openSandwichBreakdown(item: any, modal: any) {
    this.selectedSandwichItem = item;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.approvedLeaves = [...this.originalApprovedLeaves];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.approvalTable) {
          this.approvalTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle date fields
      if (['date', 'startdate', 'enddate'].includes(field)) {
        val1 = new Date(a[field]);
        val2 = new Date(b[field]);
        return event.order * (val1.getTime() - val2.getTime());
      }

      // Handle duration (numeric)
      if (field === 'duration') {
        val1 = parseFloat(a[field]) || 0;
        val2 = parseFloat(b[field]) || 0;
        return event.order * (val1 - val2);
      }

      // Handle durationType
      if (field === 'durationType') {
        const typeMap: { [key: number]: string } = {
          1: 'First Half',
          2: 'Full Day',
          3: 'Second Half'
        };
        val1 = typeMap[a[field]] || 'Unknown';
        val2 = typeMap[b[field]] || 'Unknown';
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }



  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
