import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { HolidayTabsComponent } from '../../shared/holiday-tabs/holiday-tabs.component';

@Component({
  selector: 'app-publicholidays',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, HolidayTabsComponent, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './publicholidays.component.html',
  styleUrl: './publicholidays.component.scss'
})

export class PublicholidaysComponent {
  holidaysform!: FormGroup;
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
  loading = false;
  holidayColors: string[] = [
    '#03A9F4',
    '#F9D339',
    '#E54288',
    '#53D33A',
    '#0B3A83',
    '#1064CA',
    '#FF2E22',
    '#556CEE',
    '#FF7133'
  ];

  constructor(public router: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getjobDetails();
    this.http.selectedYear$.subscribe((year) => {
      if (year) {
        this.selectedYear = year;
        this.getHoliday(this.jobshiftdetails);
      } else {
        this.getHoliday(this.jobshiftdetails);
      }
    });
  }

  getGradientId(index: number): string {
    const gradientIndex = index % 7;
    return `url(#gradient-${gradientIndex})`;
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
    this.loading = true;
    this.orgHolidayItemsArrayTrue = [];
    this.orgHolidayItemsArrayFalse = [];
    this.length = 0;
    this.optional = 0;
    let holiday = {
      locationId: jobshiftdetails[0]?.locationid,
      subLocationId: jobshiftdetails[0]?.sublocationid,
      shiftId: jobshiftdetails[0]?.shiftId,
      Applicableyear: this.selectedYear
    };
    this.subscription = this.http.getDataWithQueryParams(`orgHolidays/getHolidaysbylocation`, holiday).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.Policies = response;
        this.orgHolidayItemsArray = response[0]?.orgHolidaysItems;
        this.orgHolidayItemsArray?.forEach(item => {
          if (item.isOptional) {
            this.orgHolidayItemsArrayTrue.push(item);
            this.length = this.orgHolidayItemsArrayTrue.length
          } else {
            this.orgHolidayItemsArrayFalse.push(item);
            this.optional = this.orgHolidayItemsArrayFalse.length
          }
        });
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}