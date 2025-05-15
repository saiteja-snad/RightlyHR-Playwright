import { CommonModule } from '@angular/common';
import { Component, effect, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbNavModule, NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ICategoryDetails, Ileavesdatas, Ilpid, ILeavesTaken, ILeaves } from '../../../Interfaces/timoff-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
import { LeavesApprovaltabsComponent } from '../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component';

@Component({
  selector: 'app-add-leave',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, Select,
    RouterModule, ReactiveFormsModule, TranslateModule, LeavesApprovaltabsComponent],
  templateUrl: './add-leave.component.html',
  styleUrl: './add-leave.component.scss'
})
export class AddLeaveComponent implements OnInit,OnDestroy{
    subscription!: Subscription;
  categoryDetails = [] as ICategoryDetails[];
  leaveFormData = {} as Ileavesdatas;
  employeeiddetails = [] as any;
  optionalLeaveAllowedDays: number | undefined;
  leaveForm!: FormGroup;
  selectedleave = {} as any;
  enableHalfDayOptions: boolean = true;
  orgholidays: any;
  orgweekend: any;
  isoptionalnotallowedatWorkingdate: boolean = false;
  isNonOptionalHolidaySelected: boolean = false;
  isHolidaySelectedEndate: boolean = false;
  dateDifference: number = 0;
  dateDiff: number = 0;
  isDayTypeselected = false
  enableButton: boolean = false;
  selectedValuehalf: boolean = false;
  isFullDaySelected: boolean = false;
  status: boolean = true;
  selectedValue!: string;
  remainingLeaves!: number;
  remainingProbationLeaves: number = 0;
  empdata = {} as any;
  loggedinuser = {} as any;
  custompolicyleaves: any;
  lpdata = [] as Ilpid[];
  blockDates: any;
  blockedData: any;
  optionalHolidays: any;
  optionalHolidayCount: number = 0;
  optLevsUsed = 0;
  mustUseOptLevs: boolean = false;
  getgradedata = {} as any;
  Leavestaken: ILeavesTaken[] = [];
  maxDays: number = 0;
  leavesRemaining: number = 0;
  leavedata = [] as ILeaves[];
  minEndDate!: string;
  maxEndDate!: string;
  selectedDay = '';
  isEndDateBeforeStart: boolean = false;
  isstimeoffValid: boolean = true;
  startdatevalid: boolean = true;
  isWeekOffSelected = false;
  isWeekOffSelectedEndate = false;
  issEndDategreater: boolean = true;
  allPolicy = {} as any;
  startDate: any;
  endDate: any;
  isLoading: boolean = false;
  isHolidaySelected = false;
  model: any;
  disableSubmitButton: boolean = false;
  @ViewChild('leaveForm') work!: NgForm;
 dataType:any;
  constructor(
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private authService: AuthService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public router:Router,
    private signalService:SignalsService
  ) { 
     effect(() => {
      if (this.signalService.timecountTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getCategoryDetails();

        // Conditionally reset the signals based on their current state
        if (this.signalService.timecountTriggerSignal()) {
          this.signalService.timecountTriggerSignal.set(false);
        }
      }
    });
  }
 @Input() updateData: any;
 minDate:any;
  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    console.log(this.updateData);
    this.minDate=moment(this.updateData.date).format('YYYY-MM-DD');
    console.log(this.minDate)
    this.getCategoryDetails();
    this.initializeForm();
    this.getEmployeeid();
    this.getholidaybyempid();
    this.getcustompolicybyempid();
    this.getOrgHolidaysByEmpId();
    this.getallpolicy();
    this.getgradedata = JSON.parse(localStorage.getItem("getGradedata") || '{}');
    this.getEmployementTypeByempId(this.empdata.employeeId)
    this.getweekendbyempid()
    this.checkPreviousOptionalLeaves();
    this.startDate = this.updateData.date;
    this.endDate = this.updateData.date;
  }

  navigateOrLeavebalance() {
    this.router.navigate(['/time-off/leaves/org-leave-balance'])
  }

  convertHexToRgba(hex: string, alpha: number): string {
    if (!hex) return 'rgba(0, 0, 0, 0.2)'; // fallback
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  initializeForm() {
    this.leaveForm = this.fb.group({
      leaveType: [null, Validators.required],
      startdate: [{ value: this.updateData.date, disabled: true }],
      enddate: [{ value: this.updateData.date, disabled: true }],
      halfdayavailing: ['', Validators.required],
      availing: [{ value: '',  }],
      fulldayavailing: [{ value: '2',}],
      reason: ['', [Validators.required]]
    });
    this.leaveForm.get('startdate')?.valueChanges.subscribe(() => this.updateHalfDayOptions());
    this.leaveForm.get('enddate')?.valueChanges.subscribe(() => this.updateHalfDayOptions());
  }

  updateHalfDayOptions() {
  
    const start = this.leaveForm?.get('startdate')?.value;
    const end = this.leaveForm?.get('enddate')?.value;
      console.log(start)
    if (start && end) {
      this.leaveForm.get('halfDay')?.enable();
      this.leaveForm.get('halfdayavailing')?.enable();
      this.leaveForm.get('availing')?.enable();
      this.leaveForm.get('fulldayavailing')?.enable();
    } else {
      this.leaveForm.get('halfDay')?.disable();
      this.leaveForm.get('halfdayavailing')?.disable();
      this.leaveForm.get('availing')?.disable();
      this.leaveForm.get('fulldayavailing')?.disable();
    }
  }

  getCategoryDetails() {
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${this.empdata.employeeId}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categoryDetails = response.data as ICategoryDetails[];
          this.calculateProbationLeavs(this.categoryDetails);
          this.logOptionalLeaveDays(this.categoryDetails);
        }
      },
      error: (reason: any) => {
      },
      complete: () => { }
    })
  }

  getEmployeeid() {
    this.subscription = this.http.getData(`Employeedata/${this.empdata.employeeId}`).subscribe({
      next: (data: any) => {
        this.employeeiddetails = data;
        this.calculateProbationLeavs(this.categoryDetails);
      },
    });
  }

  checkPreviousOptionalLeaves() {
    if (!this.optionalHolidays) {
      return;
    }
    if (!this.lpdata) {
      return;
    }
    let optLevsUsed = 0;
    let otherCategoriesUsed = 0;
    this.lpdata.forEach((leave: any) => {
      const leaveDate = moment(leave.startdate).format('YYYY-MM-DD');
      const isOptionalHoliday = this.optionalHolidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(leaveDate));
      if (isOptionalHoliday) {
        if (leave.categoryName === 'Optional Holiday') {
          optLevsUsed += leave.duration;
        } else {
          otherCategoriesUsed += leave.duration;
        }
      }
    });
    if (this.optionalLeaveAllowedDays !== undefined && this.optionalLeaveAllowedDays !== null) {
      let remainingOptionalHolidays = this.optionalHolidayCount - otherCategoriesUsed;
      if (remainingOptionalHolidays <= this.optionalLeaveAllowedDays) {
        this.mustUseOptLevs = true;
      }
    }
  }

  calculateProbationLeavs(categoryDetails: ICategoryDetails[]) {
    if (this.employeeiddetails.probationEndDate) {
      let currentDate = moment();
      let probationEndDate = moment(this.employeeiddetails.probationEndDate);
      let currentDateWithoutTime = currentDate.startOf('day');
      let probationEndDateWithoutTime = probationEndDate.startOf('day');
      if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
        let dateOfJoining = moment(this.employeeiddetails.dateOfJoining);
        let probationDays = currentDate.diff(dateOfJoining, 'days');
        let months = 1;
        months += Math.floor(probationDays / 30);
        let probationCategoryDetails: ICategoryDetails[] = categoryDetails.filter(e => e.category.isProbationAllowed)
        probationCategoryDetails.forEach(e => {
          e.probationLeaves = months * e.category.probationDays
          if (e.probationLeaves >= e.allowedDays) {
            e.probationLeaves = e.allowedDays
          }
        })
      }
    }
  }

  logOptionalLeaveDays(categoryDetails: ICategoryDetails[]) {
    const optionalLeaveCategory = categoryDetails.find(detail => detail.category.name === "Optional Holiday");
    if (optionalLeaveCategory) {
      this.optionalLeaveAllowedDays = optionalLeaveCategory.allowedDays;
    } else {
    }
  }

  onleaveSelect(categoryId: number) {
    this.leaveFormData.categoryId = categoryId;
    this.selectedleave = this.categoryDetails.find(c => c.category.id == categoryId) as ICategoryDetails
    this.enableHalfDayOptions = this.selectedleave?.category?.allowedHalfDay ?? false;
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.excludeHolidays) {
      this.getholidaybyempid();
    }
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.excludeWeekends) {
      this.getweekendbyempid();
    }
    const maxDays = this.selectedleave?.allowedDays;
    const leavesTaken = this.selectedleave?.utilizedDays;
    const booked = this.selectedleave?.booked;
    this.remainingLeaves = maxDays - (leavesTaken ? leavesTaken : 0) - booked;
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.isProbationAllowed) {
      const probationLeavesTaken = this.selectedleave.probationLeaves - (leavesTaken !== undefined ? leavesTaken : 0) - booked;
      if (probationLeavesTaken >= 0) {
        this.remainingLeaves = probationLeavesTaken;
      } else {
        this.remainingProbationLeaves = 0;
      }
    } else {
      this.remainingProbationLeaves = 0;
    }
    if (this.startDate && this.endDate) {
      this.calculateDateDifference(this.startDate, this.endDate);
      this.chooseDayType(this.dataType)
    }
    setTimeout(() => {
      if (this.startDate?.control) {
      }
    });
  }

  onstartdate(action: string) {
    this.disableSubmitButton = false;
    this.leaveForm.patchValue({ halfdayavailing: null });
    this.leaveForm.patchValue({ availing: null });
    this.leaveForm.patchValue({ fulldayavailing: null });
    if (this.leaveForm.get('availing')?.value === null || this.leaveForm.get('fulldayavailing')?.value === null) {
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
    this.onEndDateChange();
    this.checkWeekends(action);
    this.dateCheckWithHolidayOrWeekend(action);
    this.issEndDategreater = true;
    // if(this.leaveForm.get('availing')?.value === null || this.leaveForm.get('fulldayavailing')?.value === null){
    //   this.disableSubmitButton = false;
    // }
  }

  updateStartDateValidity1(): void {
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (this.startDate <= this.endDate) {
      this.startdatevalid = true;
    } else {
      this.startdatevalid = false;
    }
  }

  vldateofjoin1(): void {
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    if (this.startDate < this.empdata.dateOfJoining) {
      this.isstimeoffValid = false;
    } else {
      this.isstimeoffValid = true;
    }
  }

  onEndDateChange() {
    this.startDate = moment(this.leaveForm?.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm?.get('enddate')?.value).format('YYYY-MM-DD');
    this.calculateDateDifference(this.startDate, this.endDate);
    if (this.startDate && this.endDate) {
      // Check if End Date is before Start Date
      this.isEndDateBeforeStart = new Date(this.endDate) < new Date(this.startDate);
    }
  }

  checkWeekends(action: string) {
    let selectedDate: any;
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (action === 'add') {
      selectedDate = moment(this.startDate);
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

  dateCheckWithHolidayOrWeekend(action: string) {
    let selectedDate: any;
    let selectedendDate: any;
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (action == 'add') {
      if (this.startDate) {
        selectedDate = moment(this.startDate);
      }
      if (this.endDate) {
        selectedendDate = moment(this.endDate);
      }
    }
    if (this.orgholidays?.orgHolidaysItems && !this.selectedleave?.category?.isOptionalHoliday) {
      this.orgholidays.orgHolidaysItems.forEach((element: any) => {
        const currentDate = moment(element.holidayDate);
        element.holidayDate = currentDate.format('YYYY-MM-DD');
      });
      const isDatePresent = this.orgholidays.orgHolidaysItems?.some(
        (holiday: any) => holiday.holidayDate === selectedDate.format('YYYY-MM-DD')
      );
      const isDateenddatePresent = this.orgholidays.orgHolidaysItems?.some(
        (holiday: any) => holiday.holidayDate === selectedendDate.format('YYYY-MM-DD')
      );
      let dateRange = [];
      for (let m = moment(selectedDate); m.diff(selectedendDate, 'days') <= 0; m.add(1, 'days')) {
        dateRange.push(m.format('YYYY-MM-DD'));
      }
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return this.orgholidays.orgHolidaysItems?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
    }
    if (this.orgholidays?.orgHolidaysItems && this.selectedleave?.category?.isOptionalHoliday) {
      let filteredData = this.orgholidays.orgHolidaysItems.forEach((element: any) => {
        const currentDate = moment(element.holidayDate);
        if (element.isOptional != true) {
          element.holidayDate = currentDate.format('YYYY-MM-DD');
        }
      });
      const isDatePresent = filteredData?.some(
        (holiday: any) => holiday.holidayDate === selectedDate.format('YYYY-MM-DD')
      );
      const isDateenddatePresent = filteredData?.some(
        (holiday: any) => holiday.holidayDate === selectedendDate.format('YYYY-MM-DD')
      );
      let dateRange = [];
      for (let m = moment(selectedDate); m.diff(selectedendDate, 'days') <= 0; m.add(1, 'days')) {
        dateRange.push(m.format('YYYY-MM-DD'));
      }
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return filteredData?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
    }
  }

  dateCheckWithHolidayOrWeekendForEndDateChange(action: string) {
    let selectedDate: any;
    let selectedendDate: any;
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (action == 'add') {
      if (this.startDate) {
        selectedDate = moment(this.startDate);
      }
      if (this.endDate) {
        selectedendDate = moment(this.endDate);
      }
    }
    if (this.orgholidays?.orgHolidaysItems && !this.selectedleave?.category?.isOptionalHoliday) {
      this.orgholidays.orgHolidaysItems.forEach((element: any) => {
        const currentDate = moment(element.holidayDate);
        element.holidayDate = currentDate.format('YYYY-MM-DD');
      });
      const isDatePresent = this.orgholidays.orgHolidaysItems?.some(
        (holiday: any) => holiday.holidayDate === selectedDate.format('YYYY-MM-DD')
      );
      const isDateenddatePresent = this.orgholidays.orgHolidaysItems?.some(
        (holiday: any) => holiday.holidayDate === selectedendDate.format('YYYY-MM-DD')
      );
      let dateRange = [];
      for (let m = moment(selectedDate); m.diff(selectedendDate, 'days') <= 0; m.add(1, 'days')) {
        dateRange.push(m.format('YYYY-MM-DD'));
      }
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return this.orgholidays.orgHolidaysItems?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
    }
    if (this.orgholidays?.orgHolidaysItems && this.selectedleave?.category?.isOptionalHoliday) {
      let filteredData = this.orgholidays.orgHolidaysItems.forEach((element: any) => {
        const currentDate = moment(element.holidayDate);
        if (element.isOptional != true) {
          element.holidayDate = currentDate.format('YYYY-MM-DD');
        }
      });
      const isDatePresent = filteredData?.some(
        (holiday: any) => holiday.holidayDate === selectedDate.format('YYYY-MM-DD')
      );
      const isDateenddatePresent = filteredData?.some(
        (holiday: any) => holiday.holidayDate === selectedendDate.format('YYYY-MM-DD')
      );
      let dateRange = [];
      for (let m = moment(selectedDate); m.diff(selectedendDate, 'days') <= 0; m.add(1, 'days')) {
        dateRange.push(m.format('YYYY-MM-DD'));
      }
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return filteredData?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
    }
  }

  onStartDateChange() {
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    this.minEndDate = this.startDate;
    this.maxEndDate = `${new Date(this.startDate).getFullYear() + 1}-12-31`;
  }

  getholidaybyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${empdata.employeeId}`).subscribe({
      next: (data: any) => {
        this.orgholidays = data;
      },
      error: (err: any) => {
      }
    })
  }

  getweekendbyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${empdata.employeeId}`).subscribe({
      next: (data: any) => {
        this.orgweekend = data;
      },
      error: (err: any) => {
      }
    })
  }

  onEndDate(action: string) {
    this.disableSubmitButton = false;
    this.leaveForm.patchValue({ halfdayavailing: null });
    this.leaveForm.patchValue({ availing: null });
    this.leaveForm.patchValue({ fulldayavailing: null });
    if (this.leaveForm.get('availing')?.value === null || this.leaveForm.get('fulldayavailing')?.value === null) {
      this.disableSubmitButton = true;
    }
    this.issEndDategreater = false;
    this.isoptionalnotallowedatWorkingdate = false;
    this.isstimeoffValid = true;
    this.startdatevalid = true;
    this.isNonOptionalHolidaySelected = false;
    this.isHolidaySelected = false;
    this.isWeekOffSelectedEndate = false;
    this.isWeekOffSelected = false;
    this.isHolidaySelectedEndate = false;
    this.onEndDateChange();
    this.updateEndDateValidity();
    this.updateStartDateValidity1();
    this.checkWeekendsEndate(action);
    this.dateCheckWithHolidayOrWeekendForEndDateChange(action);
    // if(this.leaveForm.get('availing')?.value === null || this.leaveForm.get('fulldayavailing')?.value === null){
    //   this.disableSubmitButton = false;
    // }
  }

  updateEndDateValidity(): void {
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (this.endDate < this.startDate) {
      this.issEndDategreater = false;
    } else {
      this.issEndDategreater = true;
    }
  }

  checkWeekendsEndate(action: string) {
    let selectedDate: any;
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
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
    const dayPresent = this.orgweekend.orgWeekendItems?.some((holiday: any) => {
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

  getcustompolicybyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`LeavePolicy/${empdata.employeeId}`).subscribe({
      next: (data: any) => {
        this.custompolicyleaves = data;
      }
    })
  }

  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  getOrgHolidaysByEmpId(): any {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${empdata.employeeId}`).subscribe({
      next: (data: any) => {
        this.custompolicyleaves = data;
        this.optionalHolidays = this.custompolicyleaves?.orgHolidaysItems.filter((item: { isOptional: boolean }) => item.isOptional);
        this.optionalHolidayCount = this.optionalHolidays.length;
        this.blockDates = this.custompolicyleaves?.orgHolidaysItems.map((item: { holidayDate: any }) => item.holidayDate);
        this.blockDates.find((item: any) => {
          this.blockedData = this.formatDate(item)
        })
      }
    })
  }

  getallpolicy() {
    this.subscription = this.http.getData("LeavePolicy/getall").subscribe({
      next: (data: any) => {
        this.allPolicy = data as ILeaves[];
        localStorage.setItem("getGradedata", JSON.stringify(data));
      },
      error: reason => console.log(reason)
    });
  }

  getEmployementTypeByempId(empid: number) {
    this.subscription = this.http.getData(`Employementtype/${empid}`).subscribe({
      next: (res: any) => {
        let sortedresponse = res.sort((a: any, b: any) => {
          if (a.empEffectiveDate < b.empEffectiveDate) {
            return -1;
          }
          if (a.empEffectiveDate > a.empEffectiveDate) {
            return 1;
          }
          return 0;
        })
        let gradeid = sortedresponse[sortedresponse.length - 1]?.gradeId
        this.getLeavePoliciesbygradeId(gradeid)
      }
    })
  }

  getLeavePoliciesbygradeId(gradeId: number) {
    this.subscription = this.http.getData(`LeavePolicy/getbygradeid/${gradeId}`).subscribe({
      next: (res: any) => {
        this.leavedata = res as ILeaves[];
        var joiningDate = new Date(this.empdata.dateOfJoining)
        const joiningYear = joiningDate.getFullYear()
        const presentDate = new Date();
        const presentYear = presentDate.getFullYear()
        if (presentYear == joiningYear) {
          const joiningMonth = (joiningDate.getMonth() + 1);
          const remainingDays = (12 - joiningMonth) * 21;
          this.leavedata.forEach((leavs: ILeaves) => {
            leavs.maxDays = Math.round((leavs.maxDays * remainingDays) / 252)
          });
        }
        this.getLeaveTakenByEmpId();
      }
    });
  }

  getLeaveTakenByEmpId() {
    let LBEId = this.empdata.employeeId;
    this.subscription = this.http.getData(`LeaveBalance/getbyid/${LBEId}`).subscribe({
      next: (data: any) => {
        const groupedData = data.reduce((acc: any, curr: any) => {
          if (acc[curr.leavePolicyId]) {
            acc[curr.leavePolicyId].leavesTaken += curr.leavesTaken;
          } else {
            acc[curr.leavePolicyId] = curr;
          }
          return acc;
        }, {});
        this.Leavestaken = Object.values(groupedData) as ILeavesTaken[];
        this.leavedata.forEach((leaves: ILeaves) => {
          this.Leavestaken.forEach((leavetaken: ILeavesTaken) => {
            if (leavetaken.leavesTaken && leaves.lpId == leavetaken.leavePolicyId) {
              leaves.leavesTaken = leavetaken.leavesTaken
            } else {
              leaves.leavesTaken = 0;
            }
          })
        })
        this.fusionMadatoryLeavsValidation()
        let maxDaysTotal = 0;
        let leavesTakenTotal = 0;
        for (let i = 0; i < this.leavedata.length; i++) {
          const { maxDays, leavesTaken } = this.leavedata[i];
          maxDaysTotal += maxDays;
          if (typeof leavesTaken === 'number' && !isNaN(leavesTaken)) {
            leavesTakenTotal += leavesTaken;
          }
        }
        this.maxDays = maxDaysTotal;
        this.leavesRemaining = maxDaysTotal - leavesTakenTotal
      },
      error: (error: any) => console.log(error)
    });
  }

  fusionMadatoryLeavsValidation() {
    const PAID_LEAVE_CATAGOEY_ID = environment.paidLeaveCategoryId
    const MANDATORY_LEAVE_CATAGOEY_ID = environment.mandatoryLeaveCategoryId
    let paidLeaveCategory = this.leavedata.find((leave: ILeaves) => leave.categoryId === PAID_LEAVE_CATAGOEY_ID) as ILeaves
    let isPaidLeavesExpired = paidLeaveCategory?.leavesTaken == paidLeaveCategory?.maxDays
    if (!isPaidLeavesExpired) {
      this.leavedata = this.leavedata.filter((leave: ILeaves) => leave.categoryId != MANDATORY_LEAVE_CATAGOEY_ID)
    }
  }

  calculateDateDifference(startDate: string, endDate: string) {
    var date1 = moment(startDate, 'YYYY-MM-DD');
    var date2 = moment(endDate, 'YYYY-MM-DD');
    var days = date2.diff(date1, 'days');
    const start = moment(startDate);
    const end = moment(endDate);
    let diff = days + 1;
    let currentDate = start;
    // while (currentDate <= end) {
    if (this.selectedleave && this.selectedleave.category) {
      if (this.selectedleave.category.excludeWeekends) {
        if (this.orgweekend?.orgWeekendItems?.some((item: any) => item.weekday === currentDate.format('dddd'))) {
          diff -= 1;
        }
      }
      if (this.selectedleave?.category.excludeHolidays && !this.selectedleave.category.isOptionalHoliday) {
        this.isoptionalnotallowedatWorkingdate = false;
        let filteredholidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => {
          return ele.isOptional != true
        })
        if (filteredholidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(currentDate))) {
          diff -= 1;
        }
      }
      else {
        diff -= 0;
      }
      if (this.orgholidays?.orgHolidaysItems?.some((holiday: any) => moment(holiday.holidayDate).isSame(startDate, 'day') && 
         (holiday.isOptional === false || holiday.isOptional === null))) {
        this.isNonOptionalHolidaySelected = true;
      } else {
        this.isNonOptionalHolidaySelected = false;
      }
      let nonOptionalHolidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => ele.isOptional === false || ele.isOptional == null);
      if (nonOptionalHolidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(endDate, 'day'))) {
        this.isHolidaySelectedEndate = true;
        this.isHolidaySelected = true;
      } else {
        this.isHolidaySelectedEndate = false;
        this.isHolidaySelected = false;
      }
      if (this.selectedleave.category.isOptionalHoliday) {
        let filteredholidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => {
          return ele.isOptional == true
        })
        let dateRange = [];
        for (let m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
          dateRange.push(m.format('YYYY-MM-DD'));
        }
        let isOptionalHolidayBetweenDates = dateRange?.some(date => {
          return !filteredholidays?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
        });
        const isStartOptionalHoliday = this.orgholidays?.orgHolidaysItems?.some((holiday: any) => {
          return moment(holiday.holidayDate).isSame(startDate, 'day') && holiday.isOptional === true;
        });
        const isEndOptionalHoliday = this.orgholidays?.orgHolidaysItems?.some((holiday: any) => {
          return moment(holiday.holidayDate).isSame(endDate, 'day') && holiday.isOptional === true;
        });
        if (isOptionalHolidayBetweenDates) {
          this.isoptionalnotallowedatWorkingdate = true;
        }
        else if (!isStartOptionalHoliday) {
          this.isoptionalnotallowedatWorkingdate = true;
        }
        else if (!isEndOptionalHoliday) {
          this.isoptionalnotallowedatWorkingdate = true;
        }
        else {
          this.isoptionalnotallowedatWorkingdate = false;
        }
      }
      else {
        this.isoptionalnotallowedatWorkingdate = false;
      }
    }
    currentDate = currentDate.add(1, 'day');
    // }
    if (endDate != null) {
      this.dateDifference = diff;
      if (this.dateDifference > 1) {
        this.chooseDayType("full");
      }
      else if (this.dateDifference <= 1) {
        this.isDayTypeselected = false;
        this.selectedValuehalf = false;
        this.enableButton = false;
      }
      this.dateDiff = this.leaveFormData.isDaytype ? this.dateDifference / 2 : this.dateDifference;
    }
  }

  chooseDayType(daytype: any) {
    this.dataType=daytype
    this.isDayTypeselected = true;
    if (daytype === 'half') {
      this.disableSubmitButton = false;
      this.leaveFormData.isDaytype = true;
      this.leaveForm.patchValue({
        halfdayavailing: '1',   // Half day selected
        fulldayavailing: null   // Clear full day selection
      });
      this.enableButton = true;

      if (this.leaveForm.get('availing')?.value === 'firsthalf') {
        this.selectedValue = '1'
        this.leaveForm.patchValue({
          halfdayavailing: '1',   // Half day selected
          fulldayavailing: null   // Clear full day selection
        });
      }
      if (this.leaveForm.get('availing')?.value === 'secondhalf') {
        this.selectedValue = '3'
        this.leaveForm.patchValue({
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
      this.leaveFormData.isDaytype = false;
      this.enableButton = false;
      if (this.enableHalfDayOptions === false) {
        this.leaveForm.get('halfdayavailing')?.disable();
        this.leaveForm.get('availing')?.disable();
      }
      this.toggleFullDayOptions(false);
      if (this.dateDifference > 1) {
        this.leaveForm.get('halfdayavailing')?.disable();
        this.leaveForm.get('availing')?.disable();
        this.leaveForm.patchValue({ fulldayavailing: '2' });
        this.leaveForm.patchValue({ halfdayavailing: null, availing: null });
      }
      // else{
      //   this.leaveForm.get('availing')?.enable();
      // }
      // if(this.leaveForm.get('availing')?.value != null || this.leaveForm.get('fulldayavailing')?.value != null){
      //   this.disableSubmitButton = false;
      // }
      this.selectedValue = '2'
    }
  }

  isOptionalHoliday(leave: any): boolean {
    const leaveStartDate = moment(leave.startdate);
    return this.optionalHolidays?.some((holiday: any) => {
      const holidayDate = moment(holiday.holidayDate);
      return holidayDate.isSame(leaveStartDate, 'day');
    });
  }

  shouldDisable(item: any) {
    if (item.category?.parentId) {
      const parentCategory = this.categoryDetails.find(category => category.category.id === item.category.parentId);
      if (parentCategory && (parentCategory.allowedDays - parentCategory.utilizedDays) > 0) {
        return true;
      }
    }
    return false;
  }

  toggleHalfDayOptions(isHalfDay: boolean) {
    this.enableButton = isHalfDay;
    this.leaveForm.get('fulldayavailing')?.clearValidators();
    this.leaveForm.patchValue({ fulldayavailing: null });
  }

  toggleFullDayOptions(isFullDay: boolean) {
    this.enableButton = isFullDay;
    this.leaveForm.get('halfdayavailing')?.clearValidators();
    this.leaveForm.get('availing')?.clearValidators();
    this.leaveForm.patchValue({ halfdayavailing: null, availing: null });
  }

  onSubmit() {
    this.isLoading = true;
    if (!this.leaveForm.invalid) {
      this.dateDiff = this.leaveFormData.isDaytype ? this.dateDifference / 2 : this.dateDifference;
      let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.leaveFormData.status = "Waiting for Approval";
      this.leaveFormData.requestType = "TimeOff";
      this.leaveFormData.employeeId = empdata.employeeId;
      this.leaveFormData.durationType = this.selectedValue;
      this.leaveFormData.duration = this.dateDiff;
      this.leaveFormData.date = moment();
      this.leaveFormData.isdeleted = true;
      this.leaveFormData.startdate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
      this.leaveFormData.enddate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
      this.leaveFormData.notes = this.leaveForm.get('reason')?.value
      if (this.empdata.probationEndDate) {
        let currentDate = moment();
        let probationEndDate = moment(this.empdata.probationEndDate);
        let currentDateWithoutTime = currentDate.startOf('day');
        let probationEndDateWithoutTime = probationEndDate.startOf('day');
        if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
          let dateOfJoining = moment(this.empdata.dateOfJoining);
          let startdate = moment(this.startDate);
          let probationDaysDiff = startdate.diff(dateOfJoining, 'days');
          let months = 1;
          months += Math.floor(probationDaysDiff / 30);
        }
      }
      const category = this.categoryDetails.find(c => c.category.id === this.selectedleave?.category.id);
      if (category) {
        category.booked += this.leaveFormData.duration;
      }
      if (category?.category.isOptionalHoliday) {
        const isOptHoliday = this.isOptionalHoliday(this.leaveFormData);
        if (this.mustUseOptLevs) {
          if (isOptHoliday) {
            if (this.selectedleave.category.name?.toLowerCase() !== 'optional holiday') {
              this.conformationPopup.openErrorModal('You must use Optional Holiday category for optional holidays');
              return;
            } else {
              this.optLevsUsed += this.leaveFormData.duration;
            }
          }
        }
        if (isOptHoliday) {
          if (this.optionalLeaveAllowedDays !== undefined) {
            if (this.optLevsUsed <= this.optionalLeaveAllowedDays) {
              if (this.selectedleave.category.name?.toLowerCase() === 'optional holiday') {
                this.optLevsUsed++;
              } else {
                this.optLevsUsed--;
              }
            } else {
              this.conformationPopup.openErrorModal('You must use Optional Holiday category for optional holidays');
              return;
            }
          }
        } else { }
        let otherCategoriesUsed = 0;
        this.lpdata.forEach((leave: any) => {
          const leaveDate = moment(leave.startdate).format('YYYY-MM-DD');
          const isOptionalHoliday = this.optionalHolidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(leaveDate));
          if (isOptionalHoliday && leave.categoryName !== 'Optional Holiday') {
            otherCategoriesUsed += leave.duration;
          }
        });
        if (isOptHoliday && this.selectedleave.category.name?.toLowerCase() !== 'optional holiday') {
          if (otherCategoriesUsed + this.leaveFormData.duration > 1) {
            this.conformationPopup.openErrorModal('You must use Optional Holiday category for optional holidays');
            return;
          } else {
            otherCategoriesUsed += this.leaveFormData.duration;
          }
        }
      }
      this.subscription = this.http.postdata("Timeoff", this.leaveFormData).subscribe({
        next: (data: any) => {
          if (data) {
            this.conformationPopup.openSuccessModal('Leave Requested successfully');
            setTimeout(() => {
              this.modalService.dismissAll();
              this.leaveForm.reset();
             window.location.reload();
            }, 2000);
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal(err.error.message);
          this.isLoading = true;
          this.isLoading = false;
        }
      });
    }
    else {
      this.conformationPopup.openErrorModal('Maximum leave limit reached for this category');
    }
  }

  cleardata() {
    this.leaveForm.reset();
    this.disableSubmitButton = false;
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
