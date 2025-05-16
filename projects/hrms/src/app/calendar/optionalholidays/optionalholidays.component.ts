import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { CommonModule } from '@angular/common';
import { HolidayTabsComponent } from "../../shared/calendar-tabs/holiday-tabs/holiday-tabs.component";
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-optionalholidays',
  imports: [ReactiveFormsModule, CommonModule, HolidayTabsComponent, Select, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './optionalholidays.component.html',
  styleUrl: './optionalholidays.component.scss'
})

export class OptionalholidaysComponent {
 
  orgHolidayItemsArrayTrue: any = [];
  orgHolidayItemsArrayFalse: any = [];
  orgHolidayItemsArray: any[] = [];
  length: number = 0;
  optional: number = 0;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  subscription!: Subscription;
  Policies: any = [];
  jobshiftdetails: any;
  years: number[] = [];
  empinfo = {} as any;
  loading=false
  constructor(public router: Router, private http: HttpService) { }

  ngOnInit(): void {
  
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getjobDetails();
  

    this.http.selectedYear$.subscribe((year) => {
      if (year) {
        this.selectedYear = year;
        this.getHoliday(this.jobshiftdetails);
      }
      else{
      
        this.getHoliday(this.jobshiftdetails);
      }
    });

  }

  getjobDetails() {
    let EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`JobDetails/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobshiftdetails = data;
        this.getHoliday(data);
      }
    });
  }

  getHoliday(jobshiftdetails: any) {
    this.loading=true
    this.orgHolidayItemsArrayTrue = [];
    this.orgHolidayItemsArrayFalse = [];
    this.length = 0;
    this.optional = 0;
    let holiday = {
      locationId: jobshiftdetails[0]?.locationid,
      subLocationId: jobshiftdetails[0]?.sublocationid,
      shiftId: jobshiftdetails[0]?.shiftId,
      Applicableyear: this.selectedYear
    }
    this.subscription = this.http.getDataWithQueryParams(`orgHolidays/getHolidaysbylocation`, holiday).subscribe({
      next: (response: any) => {
        this.loading=false
        this.Policies = response;
        this.orgHolidayItemsArray = response[0]?.orgHolidaysItems;
        this.orgHolidayItemsArray?.forEach(item => {
          if (item.isOptional) {
            this.orgHolidayItemsArrayTrue.push(item);
            this.length = this.orgHolidayItemsArrayTrue.length
          } 
        });
      },
      error: (reason: any) =>{
        console.log(reason)
        this.loading=false
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}