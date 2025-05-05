import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { HolidayTabsComponent } from "../../shared/calendar-tabs/holiday-tabs/holiday-tabs.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-publicholidays',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, HolidayTabsComponent, NoDataFoundComponent,Select],
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
  subscription: any;
  Policies: any = [];
  jobshiftdetails: any;
  years: number[] = [];
  empinfo = {} as any;

  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
  
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getjobDetails();
    
    this.http.selectedYear$.subscribe((year) => {
      if (year) {
        this.selectedYear = year;
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
    this.orgHolidayItemsArrayTrue = [];
    this.orgHolidayItemsArrayFalse = [];
    this.length = 0;
    this.optional = 0;
   
    let holiday = {
      locationId: jobshiftdetails[0].locationid,
      subLocationId: jobshiftdetails[0].sublocationid,
      shiftId: jobshiftdetails[0].shiftId,
      Applicableyear:   this.selectedYear 
    };
    this.subscription = this.http.getDataWithQueryParams(`orgHolidays/getHolidaysbylocation`, holiday).subscribe({
      next: (response: any) => {
        this.Policies = response;
        this.orgHolidayItemsArray = response[0]?.orgHolidaysItems;
        this.orgHolidayItemsArray?.forEach(item => {
          if (item.isOptional) {
            this.orgHolidayItemsArrayTrue.push(item);
            this.length = this.orgHolidayItemsArrayTrue.length;
          } else {
            this.orgHolidayItemsArrayFalse.push(item);
            this.optional = this.orgHolidayItemsArrayFalse.length;
          }
        });
      },
      error: (reason: any) => console.log(reason)
    });
  }
}