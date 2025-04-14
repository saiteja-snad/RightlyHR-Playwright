import { Component, OnDestroy, OnInit } from '@angular/core';
import { PremissionsTabsComponent } from "../../shared/premissions-tabs/premissions-tabs.component";
import { RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IJob } from '../../Interfaces/letters-model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { OrgHolidayHeader, OrgWeekendHeader } from '../comp-off/compoff.modal';
import { Subject, takeUntil } from 'rxjs';
import { IEAV, LeaveType } from '../../Interfaces/timoff-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premissions',
  imports: [PremissionsTabsComponent,RouterModule,Select,ReactiveFormsModule,CommonModule],
  templateUrl: './premissions.component.html',
  styleUrl: './premissions.component.scss'
})
export class PremissionsComponent implements OnInit,OnDestroy{


  permissiondata = {} as any;
  empinfo = {} as IJob;
  holidaysData!: OrgHolidayHeader;
  weekendsData!: OrgWeekendHeader;
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaveTypes:LeaveType [] = [] as LeaveType[];
  permissionsValue:IEAV [] = [] as IEAV[];
  currentDate: Date = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth() + 1;
  firstDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
  lastDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth, 0);
  firstDayOfCurrentMonthString = this.formatDate(this.firstDayOfCurrentMonth);
  lastDayOfCurrentMonthString = this.formatDate(this.lastDayOfCurrentMonth);
  permissionHours: number[] = [0.5,1,1.5,2];
  permissionForm!: FormGroup;
  premissionType = [
    { name: 'Short Break', value: 'short-break' },
    { name: 'Half Day', value: 'half-day' },
    { name: 'Full Day', value: 'full-day' },
    { name: 'Work From Home', value: 'work-from-home' }
  ];
  duration = [
    { name: 0.5, value: 0.5 },
    { name: 1, value: 1 },
    { name: 1.5, value: 1.5 },
    { name: 2, value: 2 }
  ];
  spinnerLoader = false;
  constructor(    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService) {


    }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeeHolidays();
    this.getEmployeeeWeekends();
    this.getDuration();
    this.getPermissionTypes()
    this.formintions()
    this.getEAVData()

  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  formintions(){
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
    this.firstDayOfCurrentMonthString = firstDayOfMonth.toISOString().split('T')[0];
    this.lastDayOfCurrentMonthString = lastDayOfMonth.toISOString().split('T')[0];
    
    this.permissionForm = this.fb.group({
      permissionDate:[null,  Validators.required, ],
      duration: [null, Validators.required],
      leaveType: [null, Validators.required],
      reason: [null, [Validators.required,Validators.maxLength(250)]]
      
    });
 
  }


  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }



  getEmployeeeHolidays() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(`orgHolidays/getOrgHoliday/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.holidaysData = data;
          console.log('Holidays', this.holidaysData);
        },
      });
  }


  getDuration(){
    this.http.getData(`PermissionTypes`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response:any) =>{
        console.log(response);
        this.leaveTypes = response
      }
    })
  }



  getEmployeeeWeekends() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.weekendsData = data;
          console.log(this.weekendsData);
        },
      });
  }

  getPermissionTypes(){
    this.http.getData(`PermissionTypes?type=${'permissions'}`).pipe(takeUntil(this.destroy$)).subscribe({
      next:(response: any) =>{
        console.log(response)
          this.leaveTypes = response as LeaveType[]
        }, error(err:any) {
          console.log("errors", err)
        },
    })
  }

  getEAVData(){
    const params='Permissions'
    const param=["maxHoursPerDay" , 'maxHoursPerMonth','pastDatesAllowed','allowedPerDay']
   this.http
    .getDatabyentriyvalue(`entityAttributeValues`, params,param).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data)
        this.permissionsValue = data as IEAV[]
      }, error(err) {
        console.log("errors", err)
      },
    });

  }

  applyPermission(permissionForm: FormGroup) {
    console.log(permissionForm.value);
    if(permissionForm.valid) {
      const formData = permissionForm.value;
  const payLoad = {
   
    raisedFor: this.empinfo.employeeId,
    requestedBy: this.empinfo.employeeId,
    requestedDate: formData.permissionDate,
    createdDate: new Date().toISOString(), // current date
    type: formData.leaveType.name,
    status:'Waiting for Approval',
    referenceTypeId: formData.leaveType.id,
    duration: formData.duration.value.toString(),
    notes:formData.reason,
    processedComment: formData.processedComment,
    moduleId:18,
  };
  console.log(payLoad);
  this.spinnerLoader = true;
  this.http.postdata('RegularizationRequests/create',payLoad).subscribe({
    next: (res:any) => {
     // this.getCompOffRequest();
     this.modalService.dismissAll();
     this.sharedModalService.openSuccessModal(
       'Request submitted successfully'
     );
     this.http.tirggerCountSignal.update((status) => ({
      ...status,
      permission: true,
    }));
    setTimeout(() => {
      window.location.reload();
    }
  , 2000);
    },
    error: (err: any) => {
      this.spinnerLoader = false;
      console.error(err);
      this.sharedModalService.openErrorModal(err.error)
  
    },
    complete: () => { 
      this.spinnerLoader = false;
      this.permissionForm.reset();
    }
  })
  

    }
    
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
