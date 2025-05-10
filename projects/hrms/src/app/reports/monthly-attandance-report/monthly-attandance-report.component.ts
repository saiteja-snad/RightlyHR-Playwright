import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-monthly-attandance-report',
  imports: [RouterModule, Select, ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './monthly-attandance-report.component.html',
  styleUrl: './monthly-attandance-report.component.scss'
})

export class MonthlyAttandanceReportComponent {
  monthlyReportForm!: FormGroup;
  years: { label: string; value: number }[] = [];
  selectedMonth: string | null = null;
  currentYear: number = moment().year();
  selectedYear: number = this.currentYear;
  isFilterGiven = false;
  StatusMsg: any;
  isLoading = false;
  spinnerLoader= false;
  // Months
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

  constructor(
    private http: HttpService, 
    private router: Router,
    private openmodalservice:OpenModalService,
    private modalService:NgbModal,
    private fb: FormBuilder,
    public rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.generateYear();
    this.initializeForm();
  }

  generateYear(){
    this.currentYear = moment().year();
    this.years = [];  // Reset the array
    const pastYears = 2;
    const futureYears = 2;
    for (let i = this.currentYear - pastYears; i <= this.currentYear + futureYears; i++) {
      this.years.push({ label: i.toString(), value: i });
    }
  }

  initializeForm(){
    this.monthlyReportForm= this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required]
    })
  }

  onMonthChangeLeave(event: any): void {
    this.selectedMonth = event.value;
  }

  generateReport(f: FormGroup) {
    this.spinnerLoader= true;
    const formData= f.value;
    const month= formData.month.value;
    const year= formData.year.label;
    
    this.http.downloadMonthlyAttendanceReport(`Reports/MonthlyAttendanceReport`, month, year).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Monthly_Attendance_${month}_${year}.xlsx`;
        link.click();
        this.openmodalservice.openSuccessModal("Monthly Attendance Report Generated Sucessfully");
      },
      error:(err: any) => {
        this.spinnerLoader= false;
        // err.error.message? err.error.message : 'Error downloading the file'
        this.openmodalservice.openErrorModal('No records found');
      },
      complete: ()=>{
        this.spinnerLoader= false;
      }
    });
  }

  redirectTo(uri: string) {
    this.modalService.dismissAll();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([uri])
    });
  }

  close() {
    this.redirectTo(this.router.url);
  }
}