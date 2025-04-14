import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { OpenModalService } from '../../services/open-modal.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-attendance',
  imports: [ CommonModule,
    TranslateModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit, OnDestroy{
  subscription!:Subscription;
  yearOptions = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025},
    { name: '2026', value: 2026 }
  ];
  
  monthOptions = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  
  employeeOptions = [
    { name: 'One', value: 1 },
    { name: 'Two', value: 2 },
    { name: 'Three', value: 3 }
  ];
  
  selectedYear: any;
  selectedMonth: any;
  selectedEmployee: any;
  constructor(private authService: AuthService,
    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal){

  }

   attendanceData = [
    { date: "01-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "First Half Leave" },
    { date: "02-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Weekend" },
    { date: "03-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Second Half Leave" },
    { date: "04-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Absent" },
    { date: "05-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "First Half WFH" },
    { date: "08-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Absent" },
    { date: "09-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" },
    { date: "10-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Second Half WFH" },
    { date: "11-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Weekend" },
    { date: "12-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Weekend" },
    { date: "13-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" },
    { date: "14-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "Second Half Leave" },
    { date: "15-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" },
    { date: "16-Jan-2025", firstIn: "-", lastOut: "-", duration: "00:00:00", status: "No Records" }
  ];
  ngOnInit(): void {
    this.getAttendnaceData();
  }
//function to get the attendance data
getAttendnaceData(){
  let  loggedInUser=this.authService.getToken();
  let employeeId=loggedInUser.employeeId;
 this.subscription= this.http.getData(`/v2/AttendanceData/employee/${employeeId}?year=${this.selectedYear}&month=${this.selectedMonth}`).subscribe({
    next(response:any){
    console.log(response)
    }
  })
}
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'absent':
      case 'absent(permission)':
        return 'status-absent';
      case 'leave':
      case 'first half leave':
      case 'second half leave':
        return 'status-leave';
      case 'wfh':
      case 'first half wfh':
      case 'second half wfh':
        return 'status-wfh';
      case 'weekend':
        return 'status-weekend';
      case 'no records':
      case 'norecords':
        return 'status-norecords';
      default:
        return '';
    }
  }
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
