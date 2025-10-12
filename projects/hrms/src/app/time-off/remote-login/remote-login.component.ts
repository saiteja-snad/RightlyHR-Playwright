import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { IJob } from '../../Interfaces/letters-model';
import { Ileavesdatas, Ilpid, IPermissionsvalue, IValidations } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { environment } from '../../../environments/environment';
import { SignalsService } from '../../services/signals.service';
import { FormValidationsService } from '../../services/form-validations.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { RemoteloginApprovalTabsComponent } from "../../shared/time-off-module-tabs/remotelogin-approval-tabs/remotelogin-approval-tabs.component";
import { TranslateModule } from '@ngx-translate/core';
import { MODULE_INFOS } from '../../shared/modules-info';
import { TimeoffYearFilterService } from '../../services/timeoff-year-filter.service';
import { Select } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { OrgHolidayHeader, OrgWeekendHeader } from '../comp-off/compoff.modal';
// import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-remote-login',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ModuleInformationComponent,
    RemoteloginApprovalTabsComponent,
    TranslateModule,
    NgbPopoverModule,
    DropdownModule,
    Select,
    // TranslateModule,
  ],
  templateUrl: './remote-login.component.html',
  styleUrl: './remote-login.component.scss',
})

export class RemoteLoginComponent {
  empinfo = {} as IJob;
  halfDayValue = {} as any;
  fullDayValue = {} as any;
  remotedata = {} as Ileavesdatas;
  lpdata = [] as Ilpid[];
  Remote = [] as any;
  hoursLimit: any;
  timeValudationError: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  addremoteForm!: FormGroup;
  wfhValidations = {} as IValidations;
  minutes!: any;
  hours!: any;
  duration!: any;
  spinnerLoader = false;
  availablebalance!: number;
  totalbalance: any;
  todayDate: string = new Date().toISOString().split('T')[0];
  moduleinfo: string = '';
  yearSelectionForm!: FormGroup;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: number[] = [];
  pastDatesAllowed!: number;
  futureDatesAllowed!: number;
  regularizationValues = [] as IPermissionsvalue[];
  holidaysData!: OrgHolidayHeader;
  weekendsData!: OrgWeekendHeader;
  isWeekOffSelected = false;
  isHolidaySelected = false;
  selectedDay = '';
  activeEmplist = [] as any;
  subscription!: Subscription;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    private signalsService: SignalsService,
    public formsValidation: FormValidationsService,
    public readonly router: Router,
    private TimeoffYearFilterService: TimeoffYearFilterService
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intializewfhForm();
    this.handleAvailingChange();
    this.getRemotLoginCriteria();
    this.getTeamManagersDetails();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.getEmployeeeHolidays();
    this.getEmployeeeWeekends();
    this.getAllEmployeeDetails();
    // year selection values
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    // Now initialize the form with the selectedYear
    this.yearSelectionForm = new FormGroup({
      selectedYear: new FormControl(this.selectedYear),
    });
    // Send initial year to the service so other component can pick it up
    this.TimeoffYearFilterService.setSelectedYear(this.selectedYear);
  }

  getAllEmployeeDetails() {
    const satus = ['Active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/remote': MODULE_INFOS.TIME_OFF_REMOTE_LOGIN_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  onYearChange() {
    const selectedYear = this.yearSelectionForm.get('selectedYear')?.value;
    this.selectedYear = selectedYear; // Update the local variable so template sees the change
    this.TimeoffYearFilterService.setSelectedYear(selectedYear);
    this.http.setSelectedYear(selectedYear);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // function to get the data of employees by hierarchy
  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empinfo.employeeId;
    this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          // No filter
          const myTeam = response.filter((e: any) => e.isAccess);
          this.getEmployeeInfo = myTeam.map((employee: any) => ({
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          }));
        }
      },
    });
  }

  pendingCount = 0;
  remoteLogin: any[] = [];
  ApprovedCount = 0;
  rejectedCount = 0;
  ProcessedCount = 0;
  disaplyapplybutton = true;
  onCheckemployee(employeedId: any) {
    this.ProcessedCount = 0;
    this.rejectedCount = 0;
    this.ApprovedCount = 0;
    this.pendingCount = 0;
    this.remoteLogin = [];
    if (employeedId) {
      this.http.setEmployeeIdRemoteLogin(employeedId);
      this.disaplyapplybutton = false;
      this.getRemoteLoginRequests(employeedId);
    } else {
      this.http.setEmployeeIdRemoteLogin(null);
      this.disaplyapplybutton = true;
      this.getRemoteLoginRequests(this.empinfo.employeeId);
    }
  }

  getRemoteLoginRequests(employeeId?: any) {
    let empId = employeeId;
    this.http.getFilterRemoteLoginDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.remoteLogin = response;
        this.pendingCount = this.remoteLogin.filter((element: { status: string }) =>
          element.status === 'Waiting for Approval').length;
        this.ApprovedCount = this.remoteLogin.filter((element: { status: string }) =>
          element.status === 'Approved').length;
        this.rejectedCount = this.remoteLogin.filter((element: { status: string }) =>
          element.status === 'Rejected').length;
        this.ProcessedCount = this.remoteLogin.filter((element: { status: string }) =>
          element.status === 'Processed').length;
      },
      error: (reason: any) => console.log(reason),
    });
  }

  intializewfhForm() {
    this.addremoteForm = this.fb.group({
      workedDate: ['', [Validators.required, this.afterJoiningDateValidator.bind(this)]],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Custom Validator: Ensure date is after the date of joining
  afterJoiningDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value && this.empinfo.dateOfJoining) {
      const selectedDate = new Date(control.value);
      const joiningDate = new Date(this.empinfo.dateOfJoining);
      // Check if the selected date is before the date of joining
      if (selectedDate < joiningDate) {
        return { beforeJoining: true };
      }
    }
    return null;
  }

  handleAvailingChange() {
    this.addremoteForm.get('availing')?.valueChanges.subscribe((value) => {
      const halfTypeControl = this.addremoteForm.get('halfType');
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
    if (this.remotedata.startTimeProp && this.remotedata.endTimeProp) {
      const formattedStartTime = moment(this.remotedata.startTimeProp).format('HH:mm');
      const formattedEndTime = moment(this.remotedata.endTimeProp).format('HH:mm');
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
      this.remotedata.duration = durationAsFloat.toFixed(2);
      // if(this.remotedata.duration >= 9){
      //   this.timeValudationError=false;
      // }
      const orgHalfDayWFHCritera = parseFloat(this.halfDayValue.value);
      if (this.remotedata.duration < orgHalfDayWFHCritera) {
        this.remotedata.duration = null;
        this.wfhValidations.DurationErrorMessage = 'Provided duration is not eligible for Comp Off';
        this.wfhValidations.isdurationValidated = true;
      } else {
        this.duration = this.remotedata.duration;
      }
      if (endTime < startTime) {
        // If Out Time is greater than In Time, set Out Time equal to In Time
        this.remotedata.endTimeProp = this.remotedata.startTimeProp;
      }
    }
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
    const formattedStartTime = moment(this.remotedata.startTimeProp).format('HH:mm');
    const formattedEndTime = moment(this.remotedata.endTimeProp).format('HH:mm');
    // Split start and end time strings into hours and minutes
    const [startHours, startMinutes] = formattedStartTime.split(':').map(Number);
    const [endHours, endMinutes] = formattedEndTime.split(':').map(Number);
    let startDate = moment(this.remotedata.startTimeProp).format('YYYY-MM-DD');
    let endDate = moment(this.remotedata.endTimeProp).format('YYYY-MM-DD');
    // Convert start and end times to total minutes
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;
    // Check if start time is greater than end time
    if (startDate > endDate || (startDate === endDate && startTimeMinutes > endTimeMinutes)) {
      this.timeValudationError = true;
    } else {
      this.timeValudationError = false;
    }
    if (endDate != startDate) {
      this.timeValudationError = false;
    }
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

  getRemotLoginCriteria() {
    const params = 'RemoteLoginEligibilityCriteria';
    const param = ['allowedPerMonth', 'pastDatesAllowed', 'futureDatesAllowed'];
    this.http.getDatabyentriyvalue(`entityAttributeValues/getv1`, params, param).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.regularizationValues = (data as IPermissionsvalue[])?.sort((a, b) => a.id - b.id);
        this.futureDatesAllowed = parseInt(this.regularizationValues?.find((item: any) => item.attribute === 'futureDatesAllowed')?.value ?? '0', 10);
        this.pastDatesAllowed = parseInt(this.regularizationValues?.find((item: any) => item.attribute === 'pastDatesAllowed')?.value ?? '0', 10);
      },
      error: (err) => {
        console.log('errors', err);
      },
    });
  }

  applyremote(addForm: FormGroup) {
    if (addForm.valid) {
      const formData = addForm.value;
      const isFullDay = +formData.availing === 2;
      const payload = {
        empId: this.empinfo.employeeId,
        startTime: formData.workedDate,
        endTime: formData.workedDate,
        requestedComments: formData.reason,
        durationType: isFullDay ? 2 : +formData.halfType,
        duration: isFullDay ? 1 : 0.5,
        status: 'Waiting for Approval',
        requestedCategory: environment.remoteLoginModuleId,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      this.spinnerLoader = true;
      this.http.postdata('AttendanceRequests', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.cleardata();
          this.sharedModalService.openSuccessModal('Remote Login request submitted successfully');
          this.signalsService.remoteLoginRequestTriggerSignal.set(true);
          this.signalsService.remoteLoginSidNavCountTriggerSignal.set(true);
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.sharedModalService.openErrorModal(err.error.message);
        },
        complete: () => {
          this.addremoteForm.reset();
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

  getEmployeeeWeekends() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http.getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.weekendsData = data;
      },
    });
  }

  getEmployeeeHolidays() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http.getData(`orgHolidays/getOrgHoliday/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.holidaysData = data;
      },
    });
  }

  weekendAndHolidaysCheck(selectedDate: string) {
    this.dateCheckWithHoliday(selectedDate);
    this.checkWeekends(selectedDate);
  }

  dateCheckWithHoliday(selectedDate: string) {
    if (this.holidaysData?.orgHolidaysItems) {
      this.holidaysData?.orgHolidaysItems?.forEach((element: any) => {
        const currentDate = new Date(element.holidayDate);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        const day = String(currentDate.getDate()).padStart(2, '0');
        element.holidayDate = `${year}-${month}-${day}`;
      });
    }
    const isDatePresent = this.holidaysData?.orgHolidaysItems?.some((holiday: any) => 
      holiday.holidayDate === selectedDate && holiday.isOptional == false);
    this.isHolidaySelected = isDatePresent;
  }

  checkWeekends(selectedDate: string) {
    let selectedDate1 = moment(selectedDate);
    let dayOfMonth = selectedDate1.date();
    let weekNumber = Math.ceil(dayOfMonth / 7);
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.selectedDay = weekdayNames[selectedDate1.day()];
    let captureHoliday: any;
    const dayPresent = this.weekendsData?.orgWeekendItems?.some((holiday: any) => {
      if (holiday.weekday === this.selectedDay) {
        captureHoliday = holiday;
        return true;
      }
      this.isWeekOffSelected = false;
      return false;
    });
    if (captureHoliday && dayPresent) {
      if (weekNumber === 1 && dayPresent) {
        if (captureHoliday.firstweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
      } else if (weekNumber === 2 && dayPresent) {
        if (captureHoliday.secondweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
      } else if (weekNumber === 3) {
        if (captureHoliday.thirdweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
      } else if (weekNumber === 4) {
        if (captureHoliday.fourthweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
      } else if (weekNumber === 5) {
        if (captureHoliday.fifthweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
      }
    }
  }

  cleardata() {
    this.modalService.dismissAll();
    this.addremoteForm.reset();
    this.isWeekOffSelected = false;
    this.isHolidaySelected = false;
    this.selectedDay = '';
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}