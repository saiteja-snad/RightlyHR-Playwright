import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { RbacService } from '../../services/rbac.service';
import { PremissionsTabsComponent } from "../../shared/time-off-module-tabs/premissions-tabs/premissions-tabs.component";
import { environment } from '../../../environments/environment';
import { FormValidationsService } from '../../services/form-validations.service';
@Component({
  selector: 'app-premissions',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    PremissionsTabsComponent,
  ],
  templateUrl: './premissions.component.html',
  styleUrl: './premissions.component.scss',
})
export class PremissionsComponent implements OnInit, OnDestroy {
  permissiondata = {} as any;
  empinfo = {} as IJob;
  holidaysData!: OrgHolidayHeader;
  weekendsData!: OrgWeekendHeader;
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaveTypes: LeaveType[] = [] as LeaveType[];
  permissionsValue: IEAV[] = [] as IEAV[];
  currentDate: Date = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth() + 1;
  firstDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
  lastDayOfCurrentMonth = new Date(this.currentYear, this.currentMonth, 0);
  firstDayOfCurrentMonthString = this.formatDate(this.firstDayOfCurrentMonth);
  lastDayOfCurrentMonthString = this.formatDate(this.lastDayOfCurrentMonth);
  permissionHours: number[] = [0.5, 1, 1.5, 2];
  permissionForm!: FormGroup;
  premissionType = [
    { name: 'Short Break', value: 'short-break' },
    { name: 'Half Day', value: 'half-day' },
    { name: 'Full Day', value: 'full-day' },
    { name: 'Work From Home', value: 'work-from-home' },
  ];
  duration = [
    { name: 0.5, value: 0.5 },
    { name: 1, value: 1 },
    { name: 1.5, value: 1.5 },
    { name: 2, value: 2 },
  ];
  spinnerLoader = false;
  pastDatesAllowed!:number;
  futureDatesAllowed!:number;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formsValidation:FormValidationsService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeeHolidays();
    this.getEmployeeeWeekends();
    // this.getDuration();
    this.getPermissionTypes();
    this.formintions();
    this.getEAVData();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formintions() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    this.firstDayOfCurrentMonthString = firstDayOfMonth
      .toISOString()
      .split('T')[0];
    this.lastDayOfCurrentMonthString = lastDayOfMonth
      .toISOString()
      .split('T')[0];
    this.permissionForm = this.fb.group({
      permissionDate: [null, Validators.required],
      duration: [null, Validators.required],
      leaveType: [null, Validators.required],
      reason: [null, [Validators.required, Validators.maxLength(250)]],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  
  getPastDate(): string {
    const days = Number(this.pastDatesAllowed ?? 0);
  
    if (isNaN(days)) {
      console.error('Invalid pastDatesAllowed:', this.pastDatesAllowed);
      return new Date().toISOString().split('T')[0]; // Fallback to current date
    }
  
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - days); // subtract days for past
    return pastDate.toISOString().split('T')[0];
  }
  
  
 
  getFutureDate(): string {
    const days = Number(this.futureDatesAllowed ?? 0);
  
    if (isNaN(days)) {
      console.error('Invalid futureDatesAllowed:', this.futureDatesAllowed);
      return new Date().toISOString().split('T')[0]; // Fallback to current date
    }
  
    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + days);
    return futureDate.toISOString().split('T')[0];
  }

  getEmployeeeHolidays() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(`orgHolidays/getOrgHoliday/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.holidaysData = data;
          console.log("Holidays Data",this.holidaysData);
        },
      });
  }

  getDuration() {
    this.http
      .getData(`PermissionTypes`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaveTypes = response;
        },
      });
  }

  getEmployeeeWeekends() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.weekendsData = data;
          console.log("Weekends Data",this.weekendsData);
        },
      });
  }

  getPermissionTypes() {
    this.http
      .getData(`PermissionTypes?type=${'Permissions'}`)
      .pipe(takeUntil(this.destroy$))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaveTypes = response as LeaveType[];
       
        },
        error(err: any) {
          console.log('errors', err);
        },
      });
  }

  getEAVData() {
    const params = 'Permissions';
    const param = [
      'maxHoursPerDay',
      'maxHoursPerMonth',
      'pastDatesAllowed',
      'allowedPerDay',
      'futureDatesAllowed'
    ];
    this.http
      .getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.permissionsValue = data as IEAV[];
          this.futureDatesAllowed = parseInt(
            this.permissionsValue.find((item: any) => item.attribute === 'futureDatesAllowed')?.value ?? '0',
            10
          );
          
          this.pastDatesAllowed = parseInt(
            this.permissionsValue.find((item: any) => item.attribute === 'pastDatesAllowed')?.value ?? '0',
            10
          );
        },
        error(err) {
          console.log('errors', err);
        },
      });
  }

  applyPermission(permissionForm: FormGroup) {
    if (permissionForm.valid) {
      const formData = permissionForm.value;
      const payLoad = {
        raisedFor: this.empinfo.employeeId,
        requestedBy: this.empinfo.employeeId,
        requestedDate: formData.permissionDate,
        createdDate: new Date().toISOString(), // current date
        type: formData.leaveType.name,
        status: 'Waiting for Approval',
        referenceTypeId: formData.leaveType.id,
        duration: formData.duration.value.toString(),
        notes: formData.reason,
        processedComment: formData.processedComment,
        moduleId: environment.permissionsModuleId,
      };
      this.spinnerLoader = true;
      this.http
        .postData('RegularizationRequests/create', payLoad, {
          responseType: 'text',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            // this.getCompOffRequest();
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request submitted successfully'
            );
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              permission: true,
            }));
            this.http.permissionTriggerSignal.set(true);
            this.permissionForm.reset();
          },
          error: (err: any) => {
            this.spinnerLoader = false;
            console.error(err);
            const errorMessage =
              typeof err.error === 'string'
                ? err.error
                : err.error?.message || 'An error occurred';

            this.sharedModalService.openErrorModal(errorMessage);
          },
          complete: () => {
            this.spinnerLoader = false;
            this.permissionForm.reset();
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}