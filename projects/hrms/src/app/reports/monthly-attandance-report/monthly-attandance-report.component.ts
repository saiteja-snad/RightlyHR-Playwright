import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { Select } from 'primeng/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-attandance-report',
  imports: [RouterModule, Select, ReactiveFormsModule, CommonModule],
  templateUrl: './monthly-attandance-report.component.html',
  styleUrl: './monthly-attandance-report.component.scss'
})
export class MonthlyAttandanceReportComponent {
  years: { label: string; value: number }[] = [];

  selectedMonth: string | null = null;
  currentYear: number = moment().year();
  selectedYear: number = this.currentYear;
  isFilterGiven = false;
  StatusMsg: any;
  isLoading= false;
  constructor(
    private http: HttpService,private router:Router
  ) { }
  ngOnInit(): void {
    this.currentYear = moment().year();
    this.years = [];  // Reset the array
    const pastYears = 2;
    const futureYears = 2;
  
    for (let i = this.currentYear - pastYears; i <= this.currentYear + futureYears; i++) {
      this.years.push({ label: i.toString(), value: i });
    }
  }
  
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];
  onMonthChangeLeave(event: any): void {
    this.selectedMonth = (event.target as HTMLSelectElement).value;
    console.log('Selected Date:', this.selectedMonth);
    this.isFilterGiven=true;
  }
  generateReport(){
    this.isLoading=true
    this.http.downloadMonthlyAttendanceReport(`Reports/MonthlyAttendanceReport`,this.selectedMonth,this.selectedYear ).subscribe(response => {
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Monthly_Attendance_${this.selectedMonth}_${this.selectedYear}.xlsx`;
      link.click();
       console.log(blob)
       const modalElement = document.getElementById('entitled');
       if (modalElement) {
         modalElement.classList.add('show');
         modalElement.style.display = 'block';
         this.StatusMsg = 'Data Generated Sucessfuly'
       }
      },
      error => {
        console.error('Error downloading the file', error);
      });
  }
  redirectTo(uri: string) {
    document.querySelectorAll('.modal-backdrop.show').forEach((element:any) => {
      element.style.display = 'none';
    });
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
  
      this.router.navigate([uri])});
  
  }

  close() {
    this.redirectTo(this.router.url);
  }

}
