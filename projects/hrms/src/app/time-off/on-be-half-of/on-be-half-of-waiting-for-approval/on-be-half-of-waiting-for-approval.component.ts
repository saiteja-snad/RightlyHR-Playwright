import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-on-be-half-of-waiting-for-approval',
  imports: [
    CommonModule,
    NgbNavModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    InfoIconComponent,
    DataLoaderContentComponent,
    TranslateModule
],
  templateUrl: './on-be-half-of-waiting-for-approval.component.html',
  styleUrl: './on-be-half-of-waiting-for-approval.component.scss',
})

export class OnBeHalfOfWaitingForApprovalComponent implements OnInit, OnDestroy{
  loggedinuser = {} as any;
  cadidateEmployeeId!: number;
  subscription!: Subscription;
  waitingForApprovalLeaves: any = [];
  selectedSandwichItem: any = null;
  totalRecords = 100;
  loading: boolean = false;
  first: any = 0;
  rows: any = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  lpdata = [] as Ilpid[];
  waitingforapprovalCount = 0;


  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService, private timeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.onBehalfOfTriggerSignal()) {
        this.cadidateEmployeeId = parseInt(
          localStorage.getItem('onbehalfof') as string
        );
        if (!isNaN(this.cadidateEmployeeId)) {
          this.getDataByLPID();
        } else {
          this.waitingForApprovalLeaves = [];
        }
        this.http.onBehalfOfTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.cadidateEmployeeId = parseInt(
      localStorage.getItem('onbehalfof') as string
    );
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
            this.waitingForApprovalLeaves = response.filter(
              (item) => item.status.toLowerCase() === 'waiting for approval'
            );
          } else {
            console.error('Invalid response format');
          }
        },
        error: (reason: any) =>{
           console.log(reason)
         
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
  }
}
