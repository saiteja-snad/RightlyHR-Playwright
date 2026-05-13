import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IJob } from '../../Interfaces/letters-model';
import { Ileavesdatas, Ilpid, IValidations } from '../../Interfaces/timoff-model';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TimeoffYearFilterService } from '../../services/timeoff-year-filter.service';
import { ConfirmationIconComponent } from "../../icons/confirmation-icon/confirmation-icon.component";
import { Skeleton } from "primeng/skeleton";
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-work-from-home',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, WfhApprovaltabsComponent,
    TranslateModule, DropdownModule, Select, ModuleInformationComponent, NgbPopoverModule, Skeleton, ConfirmationIconComponent],
  templateUrl: './work-from-home.component.html',
  styleUrl: './work-from-home.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class WorkFromHomeComponent implements OnInit, OnDestroy {
   moduleinfo: string = '';
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
  @ViewChild('wfhSummary') wfhSummary: any;
  requestSummary!: any;
  wfhValidations = {} as IValidations;
  minutes!: any;
  hours!: any;
  duration!: any;
  issEndDategreater: boolean = true;
  isNonOptionalHolidaySelected: boolean = false;
  isWeekOffSelected = false;
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
  isHolidaySelected = false;
  yearSelectionForm!: FormGroup;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: number[] = [];
  activeEmplist = [] as any;
  loadingGraph: boolean = false;
  totalCount: any;
  orgweekend: any;
  workedDate: any;
  endDate: any;
  selectedDay = '';
  disableSubmitButton: boolean = false;
  isoptionalnotallowedatWorkingdate: boolean = false;
  isstimeoffValid: boolean = true;
  startdatevalid: boolean = true;
  isWeekOffSelectedEndate = false;
  isHolidaySelectedEndate: boolean = false;
  orgholidays: any;
  selectedleave = {} as any;
  dateDifference: number = 0;
  isDayTypeselected = false
  selectedValue!: string;
  enableButton: boolean = false;
  selectedValuehalf: boolean = false;
  isFullDaySelected: boolean = false;
  isEndDateBeforeStart: boolean = false;
  custompolicyleaves: any;
  optionalHolidays: any;
  optionalHolidayCount: number = 0;
  blockDates: any;
  blockedData: any;
  selectedWFHDays: number | null = null;
  isHalfDay: boolean = false;
  enableHalfDayOptions: boolean = false;
  wfhDateRangeAllocations: any[] = [];
  activeAllocation: any = null;
  showDateRange: boolean = false;
  isMultipleDays: boolean = false;
  bookedWFHDays: number = 0;
  constructor(
    private modalService: NgbModal,
    private authService:AuthService,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
    public readonly router: Router,
    private TimeoffYearFilterService: TimeoffYearFilterService
  ) {
    effect(() => {
      if (this.http.tirggerCountSignal().wfh || this.http.wfhTriggerSignal()) {
       this.getWFHBal();
        // this.http.tirggerCountSignal.update((status) => ({
        //   ...status,
        //   wfh: false,
        // }));
        // this.http.wfhTriggerSignal.set(false);
      } else {
        this.getWFHBal();
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getWFHBal();
    this.intializewfhForm();
    this.getWfhDateRangeAllocations();
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
      selectedYear: new FormControl(this.selectedYear)
    });
    // Send initial year to the service so other component can pick it up
    this.TimeoffYearFilterService.setSelectedYear(this.selectedYear);
    this.getweekendbyempid();
    this.getholidaybyempid();
  }


  getAllEmployeeDetails() {
     const status = ['Active', 'Trainee Active', 'Active Contract'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }
  onYearChange() {
    const selectedYear = this.yearSelectionForm.get('selectedYear')?.value;
    this.selectedYear = selectedYear;  // Update the local variable so template sees the change
    this.TimeoffYearFilterService.setSelectedYear(selectedYear);
    this.http.setSelectedYear(selectedYear);
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }
  // onWFHEndDateChange() {
  //   const start = this.addWFHForm.get('workedDate')?.value;
  //   const end   = this.addWFHForm.get('endDate')?.value;

  //   if (!start || !end) {
  //     this.issEndDategreater = true;
  //     return;
  //   }
  //   const startDate = new Date(start);
  //   const endDate   = new Date(end);
  //   this.issEndDategreater = endDate >= startDate;
  //   if (this.issEndDategreater && startDate.getTime() !== endDate.getTime()) {
  //     this.addWFHForm.patchValue({
  //       availing: 2,
  //       halfType: null
  //     });
  //   }
  // }
   onWFHStartDateChange() {
    this.isWeekOffSelected = false;
    this.isHolidaySelected = false;
    this.isNonOptionalHolidaySelected = false;
    this.isWeekOffSelectedEndate = false;
    this.isHolidaySelectedEndate = false;

    const startValue = this.addWFHForm.get('startDate')?.value;
    if (!startValue) return;

    const startMoment = moment(startValue);
    const dayOfMonth = startMoment.date();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    const dayName = startMoment.format('dddd');

    let captureWeekend: any;
    const dayPresent = this.orgweekend?.orgWeekendItems?.some((item: any) => {
      if (item.weekday === dayName) { captureWeekend = item; return true; }
      return false;
    });
    if (captureWeekend && dayPresent) {
      const weekMap: { [key: number]: boolean } = {
        1: captureWeekend.firstweek, 2: captureWeekend.secondweek, 3: captureWeekend.thirdweek,
        4: captureWeekend.fourthweek, 5: captureWeekend.fifthweek
      };
      this.isWeekOffSelected = weekMap[weekNumber] === true;
    }

    const startDateStr = startMoment.format('YYYY-MM-DD');
    const nonOptionalHolidays = (this.orgholidays?.orgHolidaysItems || []).filter((h: any) => !h.isOptional);
    this.isNonOptionalHolidaySelected = nonOptionalHolidays.some(
      (h: any) => moment(h.holidayDate).format('YYYY-MM-DD') === startDateStr
    );
  }


  onWFHEndDateChange() {
    this.isWeekOffSelectedEndate = false;
    this.isHolidaySelectedEndate = false;

    const end = this.addWFHForm.get('endDate')?.value;
    const start = this.addWFHForm.get('startDate')?.value;

    if (!end) {
      this.issEndDategreater = true;
      return;
    }

    // Weekend check for end date
    const endMoment = moment(end);
    const dayOfMonth = endMoment.date();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    const dayName = endMoment.format('dddd');
    let captureWeekend: any;
    const dayPresent = this.orgweekend?.orgWeekendItems?.some((item: any) => {
      if (item.weekday === dayName) { captureWeekend = item; return true; }
      return false;
    });
    if (captureWeekend && dayPresent) {
      const weekMap: { [key: number]: boolean } = {
        1: captureWeekend.firstweek, 2: captureWeekend.secondweek, 3: captureWeekend.thirdweek,
        4: captureWeekend.fourthweek, 5: captureWeekend.fifthweek
      };
      this.isWeekOffSelectedEndate = weekMap[weekNumber] === true;
    }

    // Holiday check for end date
    const endDateStr = endMoment.format('YYYY-MM-DD');
    const nonOptionalHolidays = (this.orgholidays?.orgHolidaysItems || []).filter((h: any) => !h.isOptional);
    this.isHolidaySelectedEndate = nonOptionalHolidays.some(
      (h: any) => moment(h.holidayDate).format('YYYY-MM-DD') === endDateStr
    );

    if (!start) {
      this.issEndDategreater = true;
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    this.issEndDategreater = endDate >= startDate;

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
    this.enableHalfDayOptions = daysDiff !== 1;
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
    this.checkDateRangeAllocation();
    this.getWFHBal();
    console.log(this.addWFHForm.value)
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.isMultipleDays = false;
    this.addWFHForm.get('availing')?.enable();
    this.addWFHForm.get('halfType')?.enable();
    this.addWFHForm.reset();
    this.modalService.dismissAll();
    this.availablebalance = 0;
  }

  checkWeekends(action: string) {
    let selectedDate: any;
    this.workedDate = moment(this.addWFHForm.get('workedDate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.addWFHForm.get('endDate')?.value).format('YYYY-MM-DD');
    if (action === 'add') {
      selectedDate = moment(this.workedDate);
    }
    if (action === 'update') {
    }
    let dayOfMonth = selectedDate.date();
    let weekNumber = Math.ceil(dayOfMonth / 7);
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.selectedDay = weekdayNames[selectedDate.day()];
    let captureHoliday: any;
    const dayPresent = this.orgweekend?.orgWeekendItems?.some((holiday: any) => {
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
      this.http.setEmployeeIdWFH(null);
      this.disaplyapplybutton = true;
      this.getWorkfromhomeRequest(this.empinfo.employeeId);
      this.getWFHBalance(this.empinfo.employeeId);
    }
  }

  getWorkfromhomeRequest(employeedId: any) {
    let empId = employeedId;
    this.subscription = this.http.getFilterWFHDataByID(empId, this.selectedYear).subscribe({
      next: (response: any) => {
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
    this.subscription = this.http.getData(`WorkFromHomeEligibilityCriteria/getwfhbalance?employeeId=${empId}&workeddate=${currentDate}`).subscribe({
      next: (response: any) => {
        this.wfhBalance = response;
         this.wfhBalancesdetails=[response];
          this.loadingGraph = false;
          this.totalbalance = response.totalBalance;
          this.availablebalance = response.availableBalance;
          this.initChart(response);
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getWfhDateRangeAllocations() {
    const empId = this.empinfo.employeeId;
    this.http.getData(`WfhDateRangeAllocation/GetAll?employeeIds=${empId}&status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.wfhDateRangeAllocations = res.data?.filter((item: any) => item.status === 'Active') || [];
          this.checkDateRangeAllocation();
        },
        error: (err) => console.error('Error fetching WFH date range allocations:', err)
      });
  }

  checkDateRangeAllocation() {
    const today = moment().format('YYYY-MM-DD');
    this.activeAllocation = this.wfhDateRangeAllocations.find((allocation: any) => {
      const from = moment(allocation.effectiveFromDate).format('YYYY-MM-DD');
      const to = moment(allocation.effectiveToDate).format('YYYY-MM-DD');
      return moment(today).isBetween(from, to, 'day', '[]');
    });

    if (this.activeAllocation) {
      this.showDateRange = true;
      this.addWFHForm.get('workedDate')?.clearValidators();
      this.addWFHForm.get('startDate')?.setValidators([Validators.required]);
      this.addWFHForm.get('endDate')?.setValidators([Validators.required]);
    } else {
      this.showDateRange = false;
      this.addWFHForm.get('workedDate')?.setValidators([Validators.required]);
      this.addWFHForm.get('startDate')?.clearValidators();
      this.addWFHForm.get('endDate')?.clearValidators();
    }
    this.addWFHForm.get('workedDate')?.updateValueAndValidity();
    this.addWFHForm.get('startDate')?.updateValueAndValidity();
    this.addWFHForm.get('endDate')?.updateValueAndValidity();
  }

  getMinDateForRange(): string {
    if (this.activeAllocation) {
      const from = moment(this.activeAllocation.effectiveFromDate).format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      return moment(from).isAfter(today) ? from : today;
    }
    return moment().format('YYYY-MM-DD');
  }

  getMaxDateForRange(): string {
    return this.activeAllocation ? moment(this.activeAllocation.effectiveToDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate) {
      const start = moment(startDate);
      const end = moment(endDate);

      if (end.isBefore(start)) {
        return { endDateBeforeStart: true };
      }
    }
    return null;
  }

  calculateBookedWFH() {
    if (!this.showDateRange) {
      this.bookedWFHDays = 0;
      return;
    }

    const startDate = this.addWFHForm.get('startDate')?.value;
    const endDate = this.addWFHForm.get('endDate')?.value;
    const availing = this.addWFHForm.get('availing')?.value;

    if (!startDate || !endDate) {
      this.bookedWFHDays = 0;
      return;
    }

    const start = moment(startDate);
    const end = moment(endDate);

    if (end.isBefore(start)) {
      this.bookedWFHDays = 0;
      return;
    }

    const holidayDates: string[] = (this.orgholidays?.orgHolidaysItems || [])
      .filter((h: any) => !h.isOptional)
      .map((h: any) => moment(h.holidayDate).format('YYYY-MM-DD'));

    let count = 0;
    const current = start.clone();

    while (current.isSameOrBefore(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayName = current.format('dddd');
      const dayOfMonth = current.date();
      const weekNumber = Math.ceil(dayOfMonth / 7);

      // Check if this day is a configured weekend
      const isWeekend = (this.orgweekend?.orgWeekendItems || []).some((item: any) => {
        if (item.weekday !== dayName) return false;
        const weekMap: { [key: number]: boolean } = {
          1: item.firstweek, 2: item.secondweek, 3: item.thirdweek,
          4: item.fourthweek, 5: item.fifthweek
        };
        return weekMap[weekNumber] === true;
      });

      const isHoliday = holidayDates.includes(dateStr);

      if (!isWeekend && !isHoliday) {
        count++;
      }

      current.add(1, 'day');
    }

    // Single working day + half day selected → 0.5
    if (count === 1 && (availing === 'Half Day' || +availing === 1 || +availing === 3)) {
      this.bookedWFHDays = 0.5;
    } else {
      this.bookedWFHDays = count;
    }
  }

  checkDateRangeAndSetAvailing() {
    if (!this.showDateRange) return;

    const startDate = this.addWFHForm.get('startDate')?.value;
    const endDate = this.addWFHForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = moment(startDate);
      const end = moment(endDate);
      const daysDiff = end.diff(start, 'days') + 1;

      if (daysDiff > 1) {
        // Set isMultipleDays=true FIRST so handleAvailingChange guard fires before setValue
        this.isMultipleDays = true;
        this.addWFHForm.get('availing')?.enable();
        this.addWFHForm.get('halfType')?.clearValidators();
        this.addWFHForm.get('halfType')?.setValue(null);
        this.addWFHForm.get('halfType')?.disable();
        this.addWFHForm.get('halfType')?.updateValueAndValidity();
        this.addWFHForm.get('availing')?.setValue(2);
      } else {
        this.isMultipleDays = false;
        this.addWFHForm.get('availing')?.enable();
        this.addWFHForm.get('halfType')?.enable();
        this.addWFHForm.get('availing')?.setValue('');
        this.addWFHForm.get('halfType')?.setValue(null);
      }
    } else {
      this.isMultipleDays = false;
    }
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

        if (Array.isArray(response) && response.length) {
          const myTeam = response.filter((e: any) => e.isAccess);

          this.getEmployeeInfo = myTeam
            .map((employee: any) => ({
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName ?? ''} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName ?? ''}`.trim(),
            }))
            // Alphabetical sort by firstName (case-insensitive)
            .sort((a: any, b: any) =>
              a.firstName.localeCompare(b.firstName, 'en', { sensitivity: 'base' })
            );

          console.log('getEmployeeInfo', this.getEmployeeInfo);
        } else {
          this.getEmployeeInfo = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.getEmployeeInfo = [];
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

  getweekendbyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${empdata.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.orgweekend = data;
      },
      error: (err: any) => {
      }
    })
  }
  getOrgHolidaysByEmpId(): any {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${empdata.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.custompolicyleaves = data;
        this.optionalHolidays = this.custompolicyleaves?.orgHolidaysItems.filter((item: { isOptional: boolean }) => item.isOptional);
        this.optionalHolidayCount = this.optionalHolidays?.length;
        this.blockDates = this.custompolicyleaves?.orgHolidaysItems.map((item: { holidayDate: any }) => item.holidayDate);
        this.blockDates?.find((item: any) => {
          this.blockedData = this.formatDate(item)
        })
      }
    })
  }
  getholidaybyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${empdata.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.orgholidays = data;
      },
      error: (err: any) => {
      }
    })
  }

  updateEndDateValidity(): void {
    this.workedDate = moment(this.addWFHForm.get('workedDate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.addWFHForm.get('endDate')?.value).format('YYYY-MM-DD');
    if (this.endDate < this.workedDate) {
      this.issEndDategreater = false;
    } else {
      this.issEndDategreater = true;
    }
  }
  checkWeekendsEndate(action: string) {
    let selectedDate: any;
    this.workedDate = moment(this.addWFHForm.get('workedDate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.addWFHForm.get('endDate')?.value).format('YYYY-MM-DD');
    if (action === 'add') {
      selectedDate = moment(this.endDate);
    }
    if (action === 'update') {
    }
    let dayOfMonth = selectedDate.date();
    let weekNumber = Math.ceil(dayOfMonth / 7);
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.selectedDay = weekdayNames[selectedDate.day()];
    let captureHoliday: any;
    const dayPresent = this.orgweekend?.orgWeekendItems?.some((holiday: any) => {
      if (holiday.weekday === this.selectedDay) {
        captureHoliday = holiday;
        return true;
      }
      this.isWeekOffSelectedEndate = false;
      return false;
    });
    if (captureHoliday && dayPresent) {
      if (weekNumber === 1 && dayPresent) {
        if (captureHoliday.firstweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
      } else if (weekNumber === 2 && dayPresent) {
        if (captureHoliday.secondweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
      } else if (weekNumber === 3) {
        if (captureHoliday.thirdweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
      } else if (weekNumber === 4) {
        if (captureHoliday.fourthweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
      } else if (weekNumber === 5) {
        if (captureHoliday.fifthweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
      }
    }
  }
  dateCheckWithHolidayOrWeekendForEndDateChange(action: string) {
    this.isHolidaySelectedEndate = false;

    const endValue = this.addWFHForm.get('endDate')?.value;
    if (!endValue || !this.orgholidays?.orgHolidaysItems) return;

    const endDate = moment(endValue).format('YYYY-MM-DD');

    if (!this.selectedleave?.category?.isOptionalHoliday) {
      this.isHolidaySelectedEndate = this.orgholidays.orgHolidaysItems.some(
        (holiday: any) => moment(holiday.holidayDate).format('YYYY-MM-DD') === endDate
      );
    } else {
      const nonOptionalHolidays = this.orgholidays.orgHolidaysItems.filter((h: any) => !h.isOptional);
      this.isHolidaySelectedEndate = nonOptionalHolidays.some(
        (holiday: any) => moment(holiday.holidayDate).format('YYYY-MM-DD') === endDate
      );
    }
  }

  onEndDate(action: string) {
    this.disableSubmitButton = false;
    this.addWFHForm.patchValue({ halfdayavailing: null });
    this.addWFHForm.patchValue({ availing: null });
    this.addWFHForm.patchValue({ fulldayavailing: null });
    if (this.addWFHForm.get('availing')?.value === null || this.addWFHForm.get('fulldayavailing')?.value === null) {
      this.disableSubmitButton = true;
    }
    this.issEndDategreater = false;
    this.isoptionalnotallowedatWorkingdate = false;
    this.isstimeoffValid = true;
    this.startdatevalid = true;
    this.isNonOptionalHolidaySelected = false;
    this.isHolidaySelected = false;
    this.isHolidaySelectedEndate = false;
    const startDate = this.addWFHForm.get('workedDate')?.value;
    const endDate = this.addWFHForm.get('endDate')?.value;
    this.onEndDateChange();
    this.updateEndDateValidity();
    this.updateStartDateValidity1();
    this.checkWeekendsEndate(action);
    this.dateCheckWithHolidayOrWeekendForEndDateChange(action);
  }

  intializewfhForm() {
    this.addWFHForm = this.fb.group({
      workedDate: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', [Validators.required, Validators.minLength(10)],],
    }, { validators: this.dateRangeValidator });
    this.addWFHForm.get('startDate')?.valueChanges.subscribe(() => {
      this.checkDateRangeAndSetAvailing();
      this.calculateBookedWFH();
    });
    this.addWFHForm.get('endDate')?.valueChanges.subscribe(() => {
      this.checkDateRangeAndSetAvailing();
      this.calculateBookedWFH();
    });
  }

  handleAvailingChange() {
    this.addWFHForm.get('availing')?.valueChanges.subscribe((value) => {
      if (this.isMultipleDays) {
        return;
      }
      const halfTypeControl = this.addWFHForm.get('halfType');
      if (value === 'Half Day') {
        halfTypeControl?.setValidators([Validators.required]);
        halfTypeControl?.enable();
        halfTypeControl?.setValue(1);
      } else {
        halfTypeControl?.clearValidators();
        halfTypeControl?.setValue('');
        halfTypeControl?.disable();
      }
      halfTypeControl?.updateValueAndValidity();
      this.calculateBookedWFH();
    });
  }

  updateDuration() {
    if (this.workFromHomedata.startTimeProp && this.workFromHomedata.endTimeProp) {
      const formattedStartTime = moment(this.workFromHomedata.startTimeProp).format('HH:mm');
      const formattedEndTime = moment(this.workFromHomedata.endTimeProp).format('HH:mm');
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
        this.wfhValidations.DurationErrorMessage = 'Provided duration is not eligible for Comp Off';
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

  validateWFHDuration() {
    const start = this.addWFHForm.get('workedDate')?.value;
    const end = this.addWFHForm.get('endDate')?.value;

    if (!start || !end || this.availablebalance == null) {
      this.selectedWFHDays = null;
      this.wfhValidations.isdurationValidated = false;
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
      this.selectedWFHDays = null;
      this.wfhValidations.isdurationValidated = false;
      return;
    }

    const requestedDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

    const availing = this.addWFHForm.get('availing')?.value;
    const halfType = this.addWFHForm.get('halfType')?.value;

    let requestedDuration = requestedDays;

    if (requestedDays === 1 && availing === 'Half Day' && (halfType === 1 || halfType === 3 || halfType === '1' || halfType === '3')) {
      requestedDuration = 0.5;
    }

    this.selectedWFHDays = requestedDuration;

    if (requestedDuration > this.availablebalance) {
      this.wfhValidations.isdurationValidated = true;
      this.wfhValidations.DurationErrorMessage =
        `The WFH Balance is insufficient for the requested duration of ${requestedDuration} day(s).`;
    } else {
      this.wfhValidations.isdurationValidated = false;
    }
  }

  updateStartDateValidity1(): void {
    this.workedDate = moment(this.addWFHForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.addWFHForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (this.workedDate <= this.endDate) {
      this.startdatevalid = true;
    } else {
      this.startdatevalid = false;
    }
  }
  vldateofjoin1(): void {
    this.workedDate = moment(this.addWFHForm.get('startdate')?.value).format('YYYY-MM-DD');
    if (this.workedDate < this.empinfo.dateOfJoining) {
      this.isstimeoffValid = false;
    } else {
      this.isstimeoffValid = true;
    }
  }
  toggleFullDayOptions(isFullDay: boolean) {
    this.enableButton = isFullDay;
    this.addWFHForm.get('halfdayavailing')?.clearValidators();
    this.addWFHForm.get('availing')?.clearValidators();
    this.addWFHForm.patchValue({ halfdayavailing: null, availing: null });
  }

  chooseDayType(daytype: any) {
    this.isDayTypeselected = true;
    if (daytype === 'half') {
      this.disableSubmitButton = false;
      //this.leaveFormData.isDaytype = true;
      this.addWFHForm.patchValue({
        halfdayavailing: '1',   // Half day selected
        fulldayavailing: null   // Clear full day selection
      });
      this.enableButton = true;
      if (this.addWFHForm.get('availing')?.value === 'firsthalf') {
        this.selectedValue = '1'
        this.addWFHForm.patchValue({
          halfdayavailing: '1',   // Half day selected
          fulldayavailing: null   // Clear full day selection
        });
      }
      if (this.addWFHForm.get('availing')?.value === 'secondhalf') {
        this.selectedValue = '3'
        this.addWFHForm.patchValue({
          halfdayavailing: '1',   // Half day selected
          fulldayavailing: null   // Clear full day selection
        });
      }
      // if(this.leaveForm.get('availing')?.value != null || this.leaveForm.get('fulldayavailing')?.value != null){
      //   this.disableSubmitButton = false;
      // }
    }
    else if (daytype === 'full') {
      this.disableSubmitButton = false;
      //this.leaveFormData.isDaytype = false;
      this.enableButton = false;
      this.toggleFullDayOptions(false);
      if (this.dateDifference > 1) {
        this.addWFHForm.get('halfdayavailing')?.disable();
        this.addWFHForm.get('availing')?.disable();
        this.addWFHForm.patchValue({ fulldayavailing: '2' });
        this.addWFHForm.patchValue({ halfdayavailing: null, availing: null });
      } else {
        // For single day, enable half day options
        this.addWFHForm.get('halfdayavailing')?.enable();
        this.addWFHForm.get('availing')?.enable();
        this.addWFHForm.patchValue({ fulldayavailing: '2' });
        this.addWFHForm.patchValue({ halfdayavailing: null, availing: null });
      }
      this.selectedValue = '2'
    }
  }

  startDateErrorMessage = '';
  endDateErrorMessage = '';
  calculateDateDifference(startDate: string, endDate: string) {
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
    let diff = 0;
    this.isHolidaySelected = false;
    this.isHolidaySelectedEndate = false;
    this.isNonOptionalHolidaySelected = false;
    this.startDateErrorMessage = '';
    this.endDateErrorMessage = '';
    this.isoptionalnotallowedatWorkingdate = false;
    const nonOptionalHolidays = this.orgholidays?.orgHolidaysItems.filter((h: { isOptional: boolean; }) => !h.isOptional);
    const optionalHolidays = this.orgholidays?.orgHolidaysItems.filter((h: { isOptional: boolean; }) => h.isOptional);
    // Loop from start to end
    let current = start.clone();
    while (current.isSameOrBefore(end, 'day')) {
      const isWeekend = this.selectedleave?.category.excludeWeekends &&
        this.orgweekend?.orgWeekendItems?.some((item: { weekday: string; }) => item.weekday === current.format('dddd'));
      const isNonOptionalHoliday = this.selectedleave?.category.excludeHolidays &&
        nonOptionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(current, 'day'));
      if (!isWeekend && !isNonOptionalHoliday) {
        diff++;
      }
      current.add(1, 'day');
    }
    // Optional holiday handling
    if (this.selectedleave?.category.isOptionalHoliday) {
      let dateRange: string[] = [];
      for (let m = start.clone(); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
        dateRange.push(m.format('YYYY-MM-DD'));
      }
      const hasNonOptional = dateRange.some(date =>
        !optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; isOptional: boolean; }) => moment(holiday.holidayDate).isSame(date, 'day'))
      );
      const isStartOptional = optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; isOptional: boolean; }) =>
        moment(holiday.holidayDate).isSame(startDate, 'day')
      );
      const isEndOptional = optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; isOptional: boolean; }) =>
        moment(holiday.holidayDate).isSame(endDate, 'day')
      );
      this.isoptionalnotallowedatWorkingdate = hasNonOptional || !isStartOptional || !isEndOptional;
    }
    // Check if start or end date is a non-optional holiday
    if (nonOptionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; isOptional: boolean; }) => moment(holiday.holidayDate).isSame(startDate, 'day'))) {
      this.isNonOptionalHolidaySelected = true;
    }
    if (nonOptionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; isOptional: boolean; }) => moment(holiday.holidayDate).isSame(endDate, 'day'))) {
      this.isHolidaySelected = true;
      this.isHolidaySelectedEndate = true;
    }
    // // Check optional holiday misuse if optional leave not allowed
    // if (this.selectedleave?.category?.isOptionalHoliday === false) {
    //   const isStartOptional = optionalHolidays?.some((holiday: { holidayDate: any; }) =>
    //     this.isSameDate(holiday.holidayDate, startDate)
    //   );
    //   const isEndOptional = optionalHolidays?.some((holiday: { holidayDate: any; }) =>
    //     this.isSameDate(holiday.holidayDate, endDate)
    //   );
    //   this.startDateErrorMessage = isStartOptional ? 'Selected start date is not allowed as it is an optional holiday' : '';
    //   this.endDateErrorMessage = isEndOptional ? 'Selected end date is not allowed as it is an optional holiday' : '';
    //   if (isStartOptional || isEndOptional) {
    //     return;
    //   }
    // }
    // Set final calculated difference
    this.dateDifference = diff;
    if (diff > 1) {
      this.chooseDayType("full");
    } else {
      this.isDayTypeselected = false;
      this.selectedValuehalf = false;
      this.enableButton = false;
    }
    //this.dateDiff = this.leaveFormData.isDaytype ? diff / 2 : diff;
  }
  onEndDateChange() {
    this.workedDate = moment(this.addWFHForm.get('workedDate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.addWFHForm.get('endDate')?.value).format('YYYY-MM-DD');
    this.calculateDateDifference(this.workedDate, this.endDate);
    if (this.workedDate && this.endDate) {
      // Check if End Date is before Start Date
      this.isEndDateBeforeStart = new Date(this.endDate) < new Date(this.workedDate);
    }
  }
  dateCheckWithHolidayOrWeekend(action: string) {
    this.isHolidaySelected = false;
    this.isHolidaySelectedEndate = false;

    const startValue = this.addWFHForm.get('workedDate')?.value;
    const endValue = this.addWFHForm.get('endDate')?.value;

    if (!this.orgholidays?.orgHolidaysItems) return;

    const holidays = this.orgholidays.orgHolidaysItems.map((h: any) => ({
      holidayDate: moment(h.holidayDate).format('YYYY-MM-DD'),
      isOptional: h.isOptional
    }));

    const startDate = startValue ? moment(startValue).format('YYYY-MM-DD') : null;
    const endDate = endValue ? moment(endValue).format('YYYY-MM-DD') : null;

    // 🔹 Non-optional holiday logic
    if (!this.selectedleave?.category?.isOptionalHoliday) {
      if (startDate) {
        this.isHolidaySelected = holidays.some(
          (h: { holidayDate: string; }) => h.holidayDate === startDate
        );
      }

      if (endDate) {
        this.isHolidaySelectedEndate = holidays.some(
          (h: { holidayDate: string; }) => h.holidayDate === endDate
        );
      }
    }

    // 🔹 Optional holiday logic
    if (this.selectedleave?.category?.isOptionalHoliday) {
      const nonOptionalHolidays = holidays.filter((h: { isOptional: any; }) => !h.isOptional);

      if (startDate) {
        this.isHolidaySelected = nonOptionalHolidays.some(
          (h: { holidayDate: string; }) => h.holidayDate === startDate
        );
      }

      if (endDate) {
        this.isHolidaySelectedEndate = nonOptionalHolidays.some(
          (h: { holidayDate: string; }) => h.holidayDate === endDate
        );
      }
    }
  }

  onstartdate(action: string) {
    this.addWFHForm.get('endDate')?.reset();
    this.disableSubmitButton = false;
    this.addWFHForm.patchValue({ halfdayavailing: null });
    this.addWFHForm.patchValue({ availing: null });
    this.addWFHForm.patchValue({ fulldayavailing: null });
    if (this.addWFHForm.get('availing')?.value === null || this.addWFHForm.get('fulldayavailing')?.value === null) {
      this.disableSubmitButton = true;
    }
    this.isoptionalnotallowedatWorkingdate = false;
    this.isstimeoffValid = true;
    this.startdatevalid = true;
    this.isNonOptionalHolidaySelected = false;
    this.isHolidaySelected = false;
    this.isWeekOffSelectedEndate = false;
    this.isWeekOffSelected = false;
    this.isHolidaySelectedEndate = false;
    this.updateStartDateValidity1();
    this.vldateofjoin1();
    //this.onEndDateChange();
    this.checkWeekends(action);
    this.dateCheckWithHolidayOrWeekend(action);
    this.issEndDategreater = true;
    if (this.selectedleave?.category?.isOptionalHoliday === true) {
      const startDate = this.addWFHForm.get('workedDate')?.value;
      const endDateControl = this.addWFHForm.get('endDate');
      const halfDayControl = this.addWFHForm.get('halfdayavailing');
      const optionalHolidays = this.orgholidays?.orgHolidaysItems.filter((h: { isOptional: boolean; }) => h.isOptional);
      const isStartOptional = optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; isOptional: boolean; }) =>
        moment(holiday.holidayDate).isSame(startDate, 'day')
      );
      if (startDate && endDateControl && isStartOptional) {
        endDateControl.setValue(startDate);
        endDateControl.disable();
        halfDayControl?.disable();
        this.disableSubmitButton = false;
        this.addWFHForm.patchValue({ fulldayavailing: '2' });
        //this.chooseDayType('full');
      }
    }
    if (this.selectedleave?.category?.isOptionalHoliday === false) {
      const endDateControl = this.addWFHForm.get('endDate');
      const halfDayControl = this.addWFHForm.get('halfdayavailing');
      const startDate = this.addWFHForm.get('workedDate')?.value;
      if (startDate && endDateControl) {
        endDateControl.setValue(null);
        endDateControl.enable();
        halfDayControl?.enable();
        this.disableSubmitButton = true;
        this.addWFHForm.patchValue({ fulldayavailing: null });
      }
    }
    // if(this.leaveForm.get('availing')?.value === null || this.leaveForm.get('fulldayavailing')?.value === null){
    //   this.disableSubmitButton = false;
    // }
  }

wfhBalancesdetails=[] as any;
  getWFHBal(currentDate?: any) {
    this.loadingGraph = true;
    const empId = this.empinfo.employeeId;
    const date = currentDate ?? new Date().toISOString().split('T')[0];
    this.http.getData(`WorkFromHomeEligibilityCriteria/getwfhbalance?employeeId=${empId}&workeddate=${date}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response) {
          console.log(response)
           this.wfhBalancesdetails=[response];
          this.loadingGraph = false;
          this.totalbalance = response.totalBalance;
          this.availablebalance = response.availableBalance;
          this.initChart(response);

        }
      },
      error: (reason: any) => console.log(reason),
    });
  }

  initChart(item: any) {
    const data: number[] = [];
    const labels: string[] = [];
    const backgroundColors: string[] = [];
      data.push(item.availableBalance);
      labels.push('WFH');
      backgroundColors.push('#FF2E22');
    this.totalbalance = {
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }
      ]
    };
    this.totalbalance = {
      cutout: '70%',
      // borderWidth:'10px',
    };
  }

  getAvailablewfhs(item: any): number {
    if (item.availableBalance) {
      return item.availableBalance ;
    } else {
      return item.availableBalance;
    }
  }

  getTransparentColor(hex: string, opacity: number): string {
    // Remove leading # if present
    hex = hex.replace('#', '');
    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  getProgress(item: any): number {
    const available = this.getAvailablewfhs(item);
    const total = item.totalBalance || 1; // Avoid division by zero
    const percentage = Math.max(0, Math.min(available / total, 1)); // Clamp between 0 and 1
    return percentage * 360;
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
    this.http.getData(`WorkFromHomeEligibilityCriteria`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.Workfromhome = response;
        this.futureDatesAllowed = parseInt(this.Workfromhome?.find((item: any) => item.name === 'futureDatesAllowed')?.value ?? '0', 10);
        this.pastDatesAllowed = parseInt(this.Workfromhome?.find((item: any) => item.name === 'pastDatesAllowed')?.value ?? '0', 10);
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
    const formattedStartTime = moment(this.workFromHomedata.startTimeProp).format('HH:mm');
    const formattedEndTime = moment(this.workFromHomedata.endTimeProp).format('HH:mm');
    // Split start and end time strings into hours and minutes
    const [startHours, startMinutes] = formattedStartTime.split(':').map(Number);
    const [endHours, endMinutes] = formattedEndTime.split(':').map(Number);
    let startDate = moment(this.workFromHomedata.startTimeProp).format('YYYY-MM-DD');
    let endDate = moment(this.workFromHomedata.endTimeProp).format('YYYY-MM-DD');
    // Convert start and end times to total minutes
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;
    // Check if start time is greater than end time
    if ( startDate > endDate || (startDate === endDate && startTimeMinutes > endTimeMinutes)) {
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

      let duration: number;
      let durationType: number;

      // Calculate duration for date range
      if (this.showDateRange && formData.startDate && formData.endDate) {
        const start = moment(formData.startDate);
        const end = moment(formData.endDate);
        const daysDiff = end.diff(start, 'days') + 1;

        if (daysDiff === 1) {
          // Same date - use half/full day logic
          duration = isFullDay ? 1 : 0.5;
          durationType = isFullDay ? 2 : +formData.halfType;
        } else {
          // Multiple days - always full day
          duration = daysDiff;
          durationType = 2;
        }
      } else {
        // Single date (workedDate)
        duration = isFullDay ? 1 : 0.5;
        durationType = isFullDay ? 2 : +formData.halfType;
      }

      const payload = {
        empId: this.empinfo.employeeId,
        startTime: this.showDateRange ? formData.startDate : formData.workedDate,
        endTime: this.showDateRange ? formData.endDate : formData.workedDate,
        requestedComments: formData.reason,
        durationType: durationType,
        duration: duration,
        status: 'Waiting for Approval',
        requestedCategory: environment.wfhModuleId,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      this.spinnerLoader = true;
      this.http.postdata('AttendanceRequests', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal('Request submitted successfully');
          // this.requestSummary = res;
          // this.openModal(this.wfhSummary);
          // setTimeout(() => {
          //   this.modalService.dismissAll();
          // }, 5000);
          this.getWFHBal();
          this.http.wfhTriggerSignal.set(true);
          this.getWorkfromhomeRequest(this.empinfo?.employeeId);
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.sharedModalService.openErrorModal(err.error.message);
        },
        complete: () => {
          this.getApprovalStatusCounts();
          this.addWFHForm.reset();
          this.spinnerLoader = false;
        },
      });
    }
  }
getApprovalStatusCounts() {
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.wfhModuleId}&EmployeeId=${EmployeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
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
