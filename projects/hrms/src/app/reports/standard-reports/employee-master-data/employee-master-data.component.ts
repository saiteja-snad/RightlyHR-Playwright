import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxDaterangepickerBootstrapDirective, NgxDaterangepickerBootstrapComponent } from "ngx-daterangepicker-bootstrap";
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';

@Component({
  selector: 'app-employee-master-data',
  imports: [
    NgxDaterangepickerBootstrapDirective,
    FormsModule,
    DateformatPipe
],
  templateUrl: './employee-master-data.component.html',
  styleUrl: './employee-master-data.component.scss'
})
export class EmployeeMasterDataComponent implements OnInit,OnDestroy {

  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  subscription!:Subscription
  loggedInUser={} as IemployeeDetails
  isLoading: boolean = false;
  selectedEmployeeStatus: string | undefined = undefined;
  selectedBranchLocation: string | undefined = undefined;
  selectedJobLocation: string | undefined = undefined;
  selectedJobSubLocation: string | undefined = undefined;
  employeeMasterData = [] as any[];
  ranges: any = {
    Today: [dayjs(), dayjs()],
    Yesterday: [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };
  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };

  constructor(
    private authService:AuthService,
    private reportsService:ReportsService
  ){ }


  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.getStandardReports()
  }

  //method to get All the reports
getStandardReports() {
  this.isLoading = true;
  
  const request:IStandardReportRequest = {
    employeeStatus: this.selectedEmployeeStatus,
    dateRange: this.empMasterDataDOJDateRange ? this.empMasterDataDOJDateRange : undefined ,
    selectedBranchLocation: this.selectedBranchLocation,
    selectedJobLocation: this.selectedJobLocation,
    selectedJobSubLocation: this.selectedJobSubLocation,
  };
  
  
  this.subscription = this.reportsService.getStandardReports(request)
    .subscribe({
      next: (res: any) => {
        if (res) {
          this.employeeMasterData = res.standardReports;
         // this.maxPageNumber = res.maxPageNumber;
          console.log(this.employeeMasterData);
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {},
    });
}







  ngOnDestroy(): void {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
