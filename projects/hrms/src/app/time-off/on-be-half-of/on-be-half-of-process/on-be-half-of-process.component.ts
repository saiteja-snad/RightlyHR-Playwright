import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-on-be-half-of-process',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent, TranslateModule],
  templateUrl: './on-be-half-of-process.component.html',
  styleUrl: './on-be-half-of-process.component.scss'
})

export class OnBeHalfOfProcessComponent implements OnInit, OnDestroy{
  loggedinuser = {} as any;
  cadidateEmployeeId!: number;
  subscription!: Subscription;
  processedLeaves: any = [];
  selectedSandwichItem: any = null;
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  loading: boolean = false;

  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService, private timeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal) {
    effect(() => {
      if (this.http.onBehalfOfTriggerSignal() > 0) {
        this.cadidateEmployeeId = parseInt(
          localStorage.getItem('onbehalfof') as string
        );
        if (!isNaN(this.cadidateEmployeeId)) {
          this.getDataByLPID();
        } else {
          this.processedLeaves = [];
        }
      }
    });
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.cadidateEmployeeId = parseInt(localStorage.getItem('onbehalfof') as string);
    if (this.cadidateEmployeeId) {
      this.getDataByLPID();
    }
  }

  getDataByLPID() {
    this.loading = true;
    const selectedYear = this.timeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}?year=${selectedYear}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.processedLeaves = response.filter(item => item.status.toLowerCase() === 'processed');
          let pendingCount = this.processedLeaves.length;
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => {console.log(reason)
        this.loading = false;
        // Handle error appropriately, e.g., show a notification
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
  }
}
