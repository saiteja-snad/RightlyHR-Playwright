import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, map, Observable, Subject, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { OpenModalService } from '../../services/open-modal.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { IAttendance } from './attendance-modal';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { RbacService } from '../../services/rbac.service';
import moment from 'moment';
import { TohoursPipe } from "../../Pipes/tohours.pipe";
import { LeaveType } from '../../Interfaces/timoff-model';
import { Select } from 'primeng/select';
import { environment } from '../../../environments/environment.dev';

@Component({
  selector: 'app-attendance',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    TohoursPipe,
    Select,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
})
export class AttendanceComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  yearOptions = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
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
    { name: 'December', value: 12 },
  ];
  attendanceData = new BehaviorSubject<IAttendance[]>([]);
  selectedYear: any;
  selectedMonth: any;
  selectedEmployee: any;
  empdata = {} as Ipersonal;
  statusCounts$ = new BehaviorSubject<any[]>([]);
  shiftDetails = {} as any;
  currentMonth: any;
  currentYear: any;
  regularizationForm!: FormGroup;
  spinnerLoader = false;
  regularizationTypes: LeaveType[] = [] as LeaveType[];
  punchInData=[] as any;
  duration = [
    { name: 0.5, value: 0.5 },
    { name: 1, value: 1 },
    { name: 1.5, value: 1.5 },
    { name: 2, value: 2 },
  ];
  constructor(
    private authService: AuthService,
    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Get current date
    const currentDate = moment().date();
    // Get current month (1-based)
    this.currentMonth = moment().month() + 1;
    console.log(this.currentMonth);
    // Get current year
    this.currentYear = moment().year();
    let loggedInUser = this.authService.getToken();
    this.empdata = loggedInUser;
    this.selectedEmployee = loggedInUser.employeeId;
    this.getAttendnaceData(this.empdata.employeeId);
    this.getAllEmployeeDetails();
    this.getEmployeeDetails();
    this.initializeForm();
  }
  //function to inialize form
  initializeForm() {
    this.regularizationForm = this.fb.group({
      permissionDate: [{value:null,disable:true}, Validators.required],
      duration: [null, Validators.required],
      leaveType: [null, Validators.required],
      reason: [null, [Validators.required, Validators.maxLength(250)]],
    });
    this.regularizationForm.patchValue({
      permissionDate:moment().format('YYYY-MM-DD')
    })
    this.getDuration();
  }
  //function to open modal
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  //function to get the day logs
  punchPairs: { in?: string, out?: string }[] = [];
  selectedDate!:Date;
  dayLogsData(Value:any,date:Date){
    console.log(Value)
    this.selectedDate=date;
    if(Value){
      this.punchPairs=[];
      const inOutList = Value;
      let temp: { in?: string, out?: string } = {};
    
      inOutList.forEach((log: { direction: string; punchTime: string | undefined; }) => {
        if (log.direction === 'in') {
          // If there is already an unpaired 'in', push it and start a new one
          if (temp.in && !temp.out) {
            this.punchPairs.push(temp);
            temp = {};
          }
          temp.in = log.punchTime;
        } else {
          // If there's already an 'in', complete the pair
          if (temp.in && !temp.out) {
            temp.out = log.punchTime;
            this.punchPairs.push(temp);
            temp = {};
          } else {
            // No previous 'in', just push with only 'out'
            this.punchPairs.push({ out: log.punchTime });
          }
        }
      });
    
      // If there's a remaining 'in' without a pair
      if (temp.in && !temp.out) {
        this.punchPairs.push(temp);
      }
      this.punchInData=this.punchPairs;
    }
    else{
      this.punchPairs=[];
    }
  }
  //function to get the regularization types
  getDuration() {
    this.subscription = this.http
      .getData(`PermissionTypes?type=${'Regularization'}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.regularizationTypes = response;
        },
      });
  }
  //function to post the regularization
  applyRgularization(regularizationForm: FormGroup) {
    console.log(regularizationForm.value);
    if(regularizationForm.valid) {
      const formData = regularizationForm.value;
  const payLoad = {
   
    raisedFor: this.empdata.employeeId,
    requestedBy: this.empdata.employeeId,
    requestedDate: formData.permissionDate,
    createdDate: moment().format('YYYY-MM-DD'), // current date
    type: formData.leaveType.name,
    status:'Waiting for Approval',
    referenceTypeId: formData.leaveType.id,
    duration: formData.duration.value.toString(),
    notes:formData.reason,
    processedComment: formData.processedComment,
    moduleId:environment.attendanceRegularizationModuleId,
  };
  console.log(payLoad);
  this.spinnerLoader = true;
  this.http.postdata('RegularizationRequests/create',payLoad).subscribe({
    next: (res:any) => {
     // this.getCompOffRequest();
     this.modalService.dismissAll();
     this.conformationPopup.openSuccessModal(
       'Request submitted successfully'
     );
    this.regularizationForm.reset();
    },
    error: (err: any) => {
      this.spinnerLoader = false;
      console.error(err);
      this.conformationPopup.openErrorModal(err.error)
  
    },
    complete: () => { 
      this.spinnerLoader = false;
      this.regularizationForm.reset();
    }
  })
  

    }
  }
  //function to get the attendance data
  getAttendnaceData(employeeId: number) {
    this.subscription = this.http
      .getData(
        `v2/AttendanceData/employee/${employeeId}?year=${this.selectedYear}&month=${this.selectedMonth}`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response.data);
          this.attendanceData.next(response.data.attendanceData);
          this.statusCounts$.next(response.data.summary);
          this.shiftDetails = response.data.shiftDetails;
          // this.attendanceData.next(response.data);
        },
        error: (err: any) => {
          console.log(err);
          this.attendanceData.next([]);
        },
      });
  }
  //function to bind color for the each status
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'status-present';
      case 'half day present':
        return 'status-halfdaypresent';
      case 'absent':
      case 'absent(permission)':
        return 'status-absent';
      case 'leave':
        return 'status-leave';
      case 'half day leave':
        return 'status-leave';
      case 'first half leave':
        return 'status-leave';
      case 'second half leave':
        return 'status-leave';
      case 'wfh':
        return 'status-wfh';
      case 'first half wfh':
        return 'status-wfh';
      case 'second half wfh':
        return 'status-wfh';
      case 'half day wfh':
        return 'status-wfh';
      case 'compoff':
        return 'status-compoff';
      case 'weekoff':
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
  //function to get the count of the each status
  // statusSummary(){
  //   this.statusCounts$ = this.attendanceData.pipe(
  //     map(data => {
  //       const counts: Record<string, number> = {};
  //       data.forEach(item => {
  //         if (item.status) {
  //           counts[item.status] = (counts[item.status] || 0) + 1;
  //         }
  //       });
  //       return counts;
  //     })
  //   );
  // }
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
              .filter(
                (employee: any) =>
                  employee.employeeId !== this.empdata.employeeId
              )
              .map((employee: any) => {
                return {
                  ...employee,
                  fullName: `${
                    employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName} ${
                    employee.middleName ? employee.middleName + ' ' : ''
                  }${employee.lastName}`,
                };
              });
          }
        },
      });
  }
  // function to get the data of employees by hierarchy
  get_Employeelist_forTM = [] as any;
  getEmployeeDetails() {
    const EmployeeId = this.empdata.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (response) {
            this.get_Employeelist_forTM = response.map((employee: any) => {
              return {
                ...employee,
                fullName: `${
                  employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
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
