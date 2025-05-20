import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Select } from 'primeng/select';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-holidays-layout',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, Select],
  templateUrl: './holidays-layout.component.html',
  styleUrl: './holidays-layout.component.scss'
})
export class HolidaysLayoutComponent implements OnInit, OnDestroy {
  optionalholidaysform!: FormGroup;
  years: number[] = [];
  empinfo: any;
  orgHolidayItemsArray: any[] = [];
  length: number = 0;
  optional: number = 0;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  subscription: any;
  Policies: any = [];
  jobshiftdetails: any;

  constructor(public router: Router, private http: HttpService) { }

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