import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-holidays',
  imports: [RouterModule, CommonModule,ReactiveFormsModule,Select],
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.scss'
})

export class HolidaysComponent implements OnInit,OnDestroy {
  optionalholidaysform!: FormGroup;
  years: number[] = [];
  empinfo: any;
  
  constructor(public router: Router, private http: HttpService) { }

  orgHolidayItemsArray: any[] = [];
  length: number = 0;
  optional: number = 0;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  subscription: any;
  Policies: any = [];
  jobshiftdetails: any;



  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    // Now initialize the form with the selectedYear
    this.optionalholidaysform = new FormGroup({
      selectedYear: new FormControl(this.selectedYear)
    });
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
   
  }


  onYearChange() {
     const selectedYear = this.optionalholidaysform.get('selectedYear')?.value;
     this.http.setSelectedYear(selectedYear);
   
  }


  ngOnDestroy(): void {
   this.optionalholidaysform.reset()
   this.http.setSelectedYear(this.currentYear);
  }


}