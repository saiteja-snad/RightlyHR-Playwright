import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IJob } from '../../Interfaces/letters-model';
import { Ileavesdatas, Ilpid, IValidations } from '../../Interfaces/timoff-model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import moment from 'moment';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { WfhApprovaltabsComponent } from "../../shared/time-off-module-tabs/wfh-approvaltabs/wfh-approvaltabs.component";
import { environment } from '../../../environments/environment';
import { FormValidationsService } from '../../services/form-validations.service';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-work-from-home',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    WfhApprovaltabsComponent, TranslateModule, DropdownModule, Select,
    ModuleInformationComponent, NgbPopoverModule
],
  templateUrl: './work-from-home.component.html',
  styleUrl: './work-from-home.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class WorkFromHomeComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
   subscription!: Subscription;
  empinfo = {} as IJob;
  halfDayValue = {} as any;
  fullDayValue = {} as any;
  workFromHomedata = {} as Ileavesdatas;
  lpdata = [] as Ilpid[];
  Workfromhome = [] as any;
  hoursLimit: any;
  timeValudationError: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  addWFHForm!: FormGroup;
  wfhValidations = {} as IValidations;
  minutes!: any;
  hours!: any;
  duration!: any;
  spinnerLoader = false;
  availablebalance!: number;
  totalbalance: any;
  minDate!: string;
  maxDate!: string;
  pastDatesAllowed!: number;
  futureDatesAllowed!: number;
  ApprovedCount = 0;
  rejectedCount = 0;
  ProcessedCount = 0;
  pendingCount = 0;
  employeeid: any;
  wfhBalance: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formsValidation:FormValidationsService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getWFHBal();
    this.intializewfhForm();
    // this.halfDayValue = JSON.parse(
    //   localStorage.getItem('filterHalfDayData') || '{}'
    // );
    // this.fullDayValue = JSON.parse(
    //   localStorage.getItem('filterFullDayData') || '{}'
    // );
    this.getDataByLPID(this.empinfo.employeeId);
    this.getWorkfromhomeCriteria();
    this.handleAvailingChange();
    this.getTeamManagersDetails();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/wfh': MODULE_INFOS.ATTENDANCE_WFH_REPORTS_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
    this.addWFHForm.reset();
    this.availablebalance = 0;
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

  disaplyapplybutton = true;
  onCheckemployee(employeedId: any) {
    this.ProcessedCount = 0;
    this.rejectedCount = 0;
    this.ApprovedCount = 0;
    this.pendingCount = 0;
    this.Workfromhome = [];
    if (employeedId) {
      this.http.setEmployeeIdWFH(employeedId);
      this.disaplyapplybutton = false;
      this.getWorkfromhomeRequest(employeedId);
      this.getWFHBalance(employeedId);
    } else {
      this.disaplyapplybutton = true;
      this.getWorkfromhomeRequest(this.empinfo.employeeId);
      this.getWFHBalance(this.empinfo.employeeId);
    }
  }
  getWorkfromhomeRequest(employeedId: any) {
    let empId = employeedId;
    console.log(empId);
    this.subscription = this.http
      .getData(`Timeoff/getWorkFromHomeRequests/${empId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.Workfromhome = response;
          this.Workfromhome.forEach((element: { status: string }) => {
            if (element.status === 'Waiting for Approval') {
              this.pendingCount++;
            }
            if (element.status === 'Approved') {
              this.ApprovedCount++;
            }

            if (element.status === 'Rejected') {
              this.rejectedCount++;
            }
            if (element.status === 'Processed') {
              this.ProcessedCount++;
            }
          });
        },
        error: (reason: any) => console.log(reason),
      });
  }
  getWFHBalance(employeedId: any) {
    let empId = employeedId;
    let currentDate = new Date().toISOString().split('T')[0];
    this.subscription = this.http
      .getData(
        `WorkFromHomeEligibilityCriteria/getwfhbalance?employeeId=${empId}&workeddate=${currentDate}`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.wfhBalance = response;
        },
        error: (reason: any) => console.log(reason),
      });
  }
  // function to get the data of employees by hierarchy
  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log('getEmployeesByhierarchy', response);
          if (response && response.length) {
            // No filter
            this.getEmployeeInfo = response.map((employee: any) => ({
              ...employee,
              fullName: `${
                employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
            }));
            console.log('getEmployeeInfo', this.getEmployeeInfo);
          }
        },
      });
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

  intializewfhForm() {
    this.addWFHForm = this.fb.group({
      workedDate: ['', [Validators.required]],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', [Validators.required, Validators.minLength(10)],],
    });
  }

  handleAvailingChange() {
    this.addWFHForm.get('availing')?.valueChanges.subscribe((value) => {
      const halfTypeControl = this.addWFHForm.get('halfType');
      if (value === 'Half Day') {
        halfTypeControl?.setValidators([Validators.required]);
        halfTypeControl?.enable();
      } else {
        halfTypeControl?.clearValidators();
        halfTypeControl?.setValue('');
        halfTypeControl?.disable();
      }
      halfTypeControl?.updateValueAndValidity();
    });
  }

  updateDuration() {
    if (
      this.workFromHomedata.startTimeProp &&
      this.workFromHomedata.endTimeProp
    ) {
      const formattedStartTime = moment(
        this.workFromHomedata.startTimeProp
      ).format('HH:mm');
      const formattedEndTime = moment(this.workFromHomedata.endTimeProp).format(
        'HH:mm'
      );
      const startTime = moment(formattedStartTime, 'hh:mm A');
      const endTime = moment(formattedEndTime, 'hh:mm A');
      // Calculate the duration in minutes
      let durationMinutes = endTime.diff(startTime, 'minutes');
      if (durationMinutes < 0) {
        // If the end time is before the start time, it means it's the next day
        endTime.add(1, 'day');
      }
      // Recalculate the duration in minutes after adjusting for the next day
      const adjustedDurationMinutes = endTime.diff(startTime, 'minutes');
      this.hours = Math.floor(adjustedDurationMinutes / 60);
      this.minutes = adjustedDurationMinutes % 60;
      // Calculate duration as a float
      const durationAsFloat = this.hours + this.minutes / 60;
      this.workFromHomedata.duration = durationAsFloat.toFixed(2);
      // if(this.workFromHomedata.duration >= 9){
      //   this.timeValudationError=false;
      // }
      const orgHalfDayWFHCritera = parseFloat(this.halfDayValue?.value);
      if (this.workFromHomedata.duration < orgHalfDayWFHCritera) {
        this.workFromHomedata.duration = null;
        this.wfhValidations.DurationErrorMessage =
          'Provided duration is not eligible for Comp Off';
        this.wfhValidations.isdurationValidated = true;
      } else {
        this.duration = this.workFromHomedata.duration;
      }
      if (endTime < startTime) {
        // If Out Time is greater than In Time, set Out Time equal to In Time
        this.workFromHomedata.endTimeProp = this.workFromHomedata.startTimeProp;
      }
    }
  }

  ngAfterViewInit() {
    const workedDate = this.addWFHForm.get('workedDate')?.value;
    if (workedDate) {
      this.getWFHBal(workedDate);
    }
  }

  getWFHBal(currentDate?: any) {
    const empId = this.empinfo.employeeId;
    const date = currentDate ?? new Date().toISOString().split('T')[0];

    this.http
      .getData(
        `WorkFromHomeEligibilityCriteria/getwfhbalance?employeeId=${empId}&workeddate=${date}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.totalbalance = response.totalBalance;
            this.availablebalance = response.availableBalance;
          }
        },
        error: (reason: any) => console.log(reason),
      });
  }

  getDataByLPID(emp: any) {
    this.http.getData(`Timeoff/LPID/${emp}`).subscribe({
      next: (response: any) => {
        this.lpdata = response;
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getWorkfromhomeCriteria() {
    this.http
      .getData(`WorkFromHomeEligibilityCriteria`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.Workfromhome = response;
          this.futureDatesAllowed = parseInt(
            this.Workfromhome?.find(
              (item: any) => item.name === 'futureDatesAllowed'
            )?.value ?? '0',
            10
          );

          this.pastDatesAllowed = parseInt(
            this.Workfromhome?.find(
              (item: any) => item.name === 'pastDatesAllowed'
            )?.value ?? '0',
            10
          );
        },
        error: (reason: any) => console.log(reason),
      });
  }

  //max value of the time in compoff
  getMaxDateTime(startTime: string): string {
    if (!startTime) return ''; // Return empty string if start time is not defined
    const startDate = new Date(startTime); // Parse start time string to Date object
    let hours = this.hoursLimit;
    // console.log(hours.value);
    startDate.setHours(startDate.getHours() + parseInt(hours.value)); // Add 10 hours to the start time
    return startDate.toISOString(); // Convert Date object back to ISO string
  }

  dateTimeValidations() {
    const formattedStartTime = moment(
      this.workFromHomedata.startTimeProp
    ).format('HH:mm');
    const formattedEndTime = moment(this.workFromHomedata.endTimeProp).format(
      'HH:mm'
    );
    // Split start and end time strings into hours and minutes
    const [startHours, startMinutes] = formattedStartTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = formattedEndTime.split(':').map(Number);
    let startDate = moment(this.workFromHomedata.startTimeProp).format(
      'YYYY-MM-DD'
    );
    let endDate = moment(this.workFromHomedata.endTimeProp).format(
      'YYYY-MM-DD'
    );
    // Convert start and end times to total minutes
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;
    // Check if start time is greater than end time
    if (
      startDate > endDate ||
      (startDate === endDate && startTimeMinutes > endTimeMinutes)
    ) {
      this.timeValudationError = true;
    } else {
      this.timeValudationError = false;
    }
    if (endDate != startDate) {
      this.timeValudationError = false;
    }
  }

  applyWFH(addForm: FormGroup) {
    if (addForm.valid) {
      const formData = addForm.value;
      const isFullDay = +formData.availing === 2;
      const payload = {
        empId: this.empinfo.employeeId,
        startTime: formData.workedDate,
        endTime: formData.workedDate,
        requestedComments: formData.reason,
        durationType: isFullDay ? 2 : +formData.halfType, // 1: First Half, 3: Second Half, 2: Full Day
        duration: isFullDay ? 1 : 0.5,
        status: 'Waiting for Approval',
        // reason: formData.reason,
        requestedCategory: environment.wfhModuleId,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      this.spinnerLoader = true;
      this.http
        .postdata('AttendanceRequests', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request submitted successfully'
            );
            this.getWFHBal();
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              wfh: true,
            }));
            this.http.wfhTriggerSignal.set(true);
          },
          error: (err: any) => {
            this.spinnerLoader = false;
            this.sharedModalService.openErrorModal(err.error.message);
          },
          complete: () => {
            this.addWFHForm.reset();
            this.spinnerLoader = false;
          },
        });
    }
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdWFH(null);
  }
}