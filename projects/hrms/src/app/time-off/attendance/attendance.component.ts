import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
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
import { IAttendance } from './attendance-modal';
import { Ipersonal } from '../../Interfaces/personal-modal';

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
  attendanceData = new BehaviorSubject<IAttendance[]>([])
  selectedYear: any;
  selectedMonth: any;
  selectedEmployee: any;
  empdate={} as Ipersonal;
  constructor(private authService: AuthService,
    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal){

  }

  
  ngOnInit(): void {
    let  loggedInUser=this.authService.getToken();
    this.empdate=loggedInUser;
    this.selectedEmployee=loggedInUser.employeeId;
    this.getAttendnaceData(this.empdate.employeeId);
    this.getAllEmployeeDetails();
  }
//function to get the attendance data
getAttendnaceData(employeeId:number){
 this.subscription= this.http.getData(`v2/AttendanceData/employee/${employeeId}?year=${this.selectedYear}&month=${this.selectedMonth}`).subscribe({
    next:(response:any)=>{
    console.log(response.data)
    this.attendanceData.next(response.data)
    // this.attendanceData.next(response.data);
    },
    error:(err:any)=>{
      console.log(err)
      this.attendanceData.next([]);
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
        case 'half day remote':
          return 'status-remote';
      case 'no records':
      case 'norecords':
        return 'status-norecords';
      default:
        return '';
    }
  }
    // function to get the data of employees by hierarchy
    getAllEmployeeInfo = [] as any;
    getAllEmployeeDetails() {
      // let EmployeeId=this.employeeId;
      const satus = ['active', 'Trainee Active'];
      this.subscription = this.http
        .getData(`Employeedata/Getallemployees?statuses=${satus}`)
        .subscribe({
          next: (response: any) => {
           // console.log(response);
            if (response) {
              this.getAllEmployeeInfo = response
              .filter((employee: any) => employee.employeeId !== this.empdate.employeeId)
              .map((employee: any) => {
                return {
                  ...employee,
                  fullName: `${
                    employee.employeeId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName} ${
                    employee.middleName ? employee.middleName + ' ' : ''
                  }${employee.lastName}`,
                };
              });
            }
          },
        });
    }
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
