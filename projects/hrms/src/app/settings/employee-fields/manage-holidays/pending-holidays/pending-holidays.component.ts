import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-pending-holidays',
  imports: [CommonModule,NoDataFoundComponent],
  templateUrl: './pending-holidays.component.html',
  styleUrl: './pending-holidays.component.scss'
})
export class PendingHolidaysComponent {

  subscription!: Subscription
  allHolidays = [] as any;
  updateView = false;
  viewlistbuttonInUpdate = false
  selectedHoliday = [] as any
  publishedHolidayView = true;
  allowedtoUpdate = true;
  objectforUpdate: any
  initialLength!: number
  minDate!: string | null;
  maxDate!: string | null;
  selectedcode: string[] = [];
  selectedDates: Date[] = [];
  currentYear: number = new Date().getFullYear();
  cloning = false;
  selectedYear = this.currentYear;
  pendingHolidays = [] as any;
  titlehide = true;
  titlebackshoaw = false;
  rows: any = [{
    isOptionalHoliday: false,
    holidayDate: '',
    holidayName: '',

  }];
  

  
  constructor( public router:Router, private http : HttpService) { }

  
  ngOnInit(){
    this.getAllHolidays();
  }

 
  getAllHolidays() {
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allHolidays = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        ).reverse();
        console.log(this.allHolidays);
        
      },error: (err: any) => {
        console.error(err);
      }
    })
  }

  updateHoliday(holiday: any) {
    // this.disableUpdate= true;
    // this.titlehide = false;
    // this.titlebackshoaw = true;
    this.updateView = true;
    this.allowedtoUpdate = false
    this.viewlistbuttonInUpdate = true
    this.selectedHoliday = holiday;
    this.objectforUpdate = holiday;
    
    console.log(this.selectedHoliday);
    this.initialLength = this.selectedHoliday.orgHolidaysItems.length;
    console.log(this.initialLength);

    this.minDate = `${this.selectedHoliday.applicableyear}-01-01`;
    this.maxDate = `${this.selectedHoliday.applicableyear}-12-31`;
    this.selectedHoliday.orgHolidaysItems.forEach((element: any) => {
      element.holidayDate = element.holidayDate.substring(0, 10);
      this.selectedcode.push(element.holidayName);
      this.selectedDates.push(element.holidayDate);
    });
    this.selectedHoliday.applicableyear = this.selectedHoliday.applicableyear.substring(0, 10)
  }

  
  cloneHolidayPolicy(policy: any) {
    this.cloning = true;
    this.selectedHoliday = policy;
    this.selectedYear = this.selectedHoliday.applicableyear;
    this.minDate = `${this.selectedYear}-01-01`;
    this.maxDate = `${this.selectedYear}-12-31`;
    console.log(this.selectedHoliday.orgHolidaysItems);
    for (let index = 0; index < this.selectedHoliday.orgHolidaysItems.length; index++) {
      this.rows[0].holidayName = this.selectedHoliday.orgHolidaysItems[0].holidayName
      this.rows[0].holidayDate = this.selectedHoliday.orgHolidaysItems[0].holidayDate.substring(0, 10)
      this.rows[0].isOptionalHoliday = this.selectedHoliday.orgHolidaysItems[0].isOptional

      if (index > 0) {
        this.rows.push({
          holidayName: this.selectedHoliday.orgHolidaysItems[index].holidayName,
          holidayDate: this.selectedHoliday.orgHolidaysItems[index].holidayDate.substring(0, 10),
          isOptionalHoliday: this.selectedHoliday.orgHolidaysItems[index].isOptional,
        });
      }
    }
  }

  viewPublishedholiday(holiday: any) {
    this.publishedHolidayView = false
    this.titlehide = false;
    this.titlebackshoaw = true;
    this.updateView = true;
    this.viewlistbuttonInUpdate = true
    this.selectedHoliday = holiday
    console.log(this.selectedHoliday);
    this.selectedHoliday.orgHolidaysItems.forEach((element: any) => {
      element.holidayDate = element.holidayDate.substring(0, 10)
    });
  }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }



  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
