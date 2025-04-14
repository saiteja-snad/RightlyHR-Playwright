import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { TabsModule } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-publicholidays',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, TabsModule, Select, NoDataFoundComponent],
  templateUrl: './publicholidays.component.html',
  styleUrl: './publicholidays.component.scss'
})
export class PublicholidaysComponent {

  holidaysform!: FormGroup;
  orgHolidayItemsArrayTrue:any = [];
  orgHolidayItemsArrayFalse:any =[];
  orgHolidayItemsArray: any[] = [];
  length: number = 0;
  optional:number = 0;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  subscription: any;
  Policies: any = [];
  jobshiftdetails: any;
  years: number[] = [];
  empinfo = {} as any;
  navTabs: any[] = [
    { label: 'Public Holidays', link: '/holidays/public-holidays' },
    { label: 'Optional Holidays', link: '/holidays/optional-holidays' },
   
  ];

  constructor(public router: Router, private fb: FormBuilder, private conformationPopup: OpenModalService,
    private http: HttpService) { }
    ngOnInit(): void {
      this.holidaysform = new FormGroup({
        selectedYear: new FormControl(this.selectedYear)
      });
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      console.log(this.empinfo.employeeId);
      this.getjobDetails();
       this.currentYear = new Date().getFullYear();
       for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
           this.years.push(i);
       }
       this.selectedYear = this.currentYear;
     
     
    }
  
    getjobDetails() {
      let EmployeeId = this.empinfo.employeeId;
      console.log(EmployeeId);
      this.subscription = this.http.getData(`JobDetails/${EmployeeId}`).subscribe({
          next: (data: any) => {
              console.log(data);
              this.jobshiftdetails = data;
              console.log(this.jobshiftdetails);
              this.getHoliday(data);
          }
      });
    }
    getHoliday(jobshiftdetails:any) {
      
      this.orgHolidayItemsArrayTrue = [];
      this.orgHolidayItemsArrayFalse = [];
      this.length = 0;
      this.optional = 0;
  
     
  
      let holiday = {
          locationId: jobshiftdetails[0].locationid,
          subLocationId:jobshiftdetails[0].sublocationid ,
          shiftId: jobshiftdetails[0].shiftId,
          Applicableyear: this.selectedYear
      }
      console.log(holiday);
  
      this.subscription = this.http.getDataWithQueryParams(`orgHolidays/getHolidaysbylocation`, holiday).subscribe({
          next: (response: any) => {
              this.Policies = response;
              console.log(this.Policies);
              
              this.orgHolidayItemsArray = response[0].orgHolidaysItems;
              console.log(this.orgHolidayItemsArray);
              this.orgHolidayItemsArray.forEach(item => {
                if (item.isOptional) {
                    this.orgHolidayItemsArrayTrue.push(item);
                    this.length = this.orgHolidayItemsArrayTrue.length
                } else {
                   this.orgHolidayItemsArrayFalse.push(item);
                   this.optional = this.orgHolidayItemsArrayFalse.length
                }
            });
              
          },
          error: (reason: any) => console.log(reason)
      });
  }

}

