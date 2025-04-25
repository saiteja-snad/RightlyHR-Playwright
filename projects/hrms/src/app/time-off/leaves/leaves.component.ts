import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';
import { RouterModule } from '@angular/router';
import { ICategoryDetails, ILeaves, Ileavesdatas, ILeavesTaken, Ilpid } from '../../Interfaces/timoff-model';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import moment from 'moment';
import { environment } from '../../../environments/environment';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
import { LeavesApprovaltabsComponent } from "../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";

@Component({
  selector: 'app-leaves',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, Select,
    RouterModule, ReactiveFormsModule, TranslateModule, LeavesApprovaltabsComponent],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.scss'
})
export class LeavesComponent {
  subscription!: Subscription;
  categoryDetails = [] as ICategoryDetails[];
  leaveFormData = {} as Ileavesdatas;
  employeeiddetails = [] as any;
  optionalLeaveAllowedDays: number | undefined;
  leaveForm!: FormGroup;
  isSubmitted = false;
  selectedleave = {} as any;
  enableHalfDayOptions: boolean = true;
  orgholidays: any;
  orgweekend: any;
  isoptionalnotallowedatWorkingdate: boolean = false;
  isNonOptionalHolidaySelected: boolean = false;
  isHolidaySelectedEndate: boolean = false;
  dateDifference: number = 0;
  dateDiffedit: number = 0;
  dateDiff: number = 0;
  isDayTypeselected = false
  enableButton: boolean = false;
  selectedValuehalf: boolean = false;
  isFullDaySelected: boolean = false;
  status: boolean = true;
  selectedValue!: string;
  issubmitdiable:boolean=false;
  remainingLeaves!: number;
  remainingProbationLeaves: number = 0;
  empdata = {} as any;
  loggedinuser = {} as any;
  custompolicyleaves: any;
  lpdata = [] as Ilpid[];
  waitingforapprovalCount = 0;
  draftsCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  processedCount = 0;
  cancelledCount = 0;
  waitingForApprovalLeaves: any=[];
  draftLeaves: any=[];
  rejectedLeaves: any=[];
  processedLeaves: any=[];
  cancelledLeaves: any=[];
  approvedLeaves: any=[];
  blockDates: any;
  blockedData: any;
  optionalHolidays: any;
  optionalHolidayCount: number = 0;
  optLevsUsed = 0;
  mustUseOptLevs: boolean = false;
  leavedatatimeoff: any;
  leavedatas: any;
  getgradedata = {} as any;
  Leavestaken: ILeavesTaken[] = [];
  maxDays: number = 0;
  leavesRemaining: number = 0;
  Status!: string;
  DisableSubmitButton=false;
  disableSubmitButton= false;
  leavedata = [] as ILeaves[];
  minStartDate!: string;
  maxStartDate!: string;
  minEndDate!: string;
  maxEndDate!: string;
  selectedDay = '';
  selectedFields = {} as any;
  isEndDateBeforeStart: boolean = false;
  isstimeoffValid: boolean = true;
  startdatevalid: boolean = true;
  isWeekOffSelected = false;
  isWeekOffSelectedEndate = false;
  issEndDategreater: boolean = true;
  allPolicy = {} as any;
  hasErrors = false;
  startDate:any;
  isLoading: boolean = false;
  endDate : any;
  @ViewChild('leaveForm') work!: NgForm;
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  
  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getCategoryDetails();
    this.initializeForm();
    this.getEmployeeid();
    this.getholidaybyempid();
    this.getcustompolicybyempid();
    this.getLeavesData()
    this.getOrgHolidaysByEmpId()
    this.getDataByLPID()
    this.getallpolicy();
    this.getgradedata = JSON.parse(localStorage.getItem("getGradedata") || '{}');
    this.getEmployementTypeByempId(this.empdata.employeeId)
    this.date = localStorage.getItem('date')
    this.dateFormate();
    this.getweekendbyempid()
    this.checkPreviousOptionalLeaves();
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
  }
  dd: any;
  mm: any;
  yy: any;
  date: any;
  d: string = 'dd/mm/yyyy';
  m: string = 'mm/dd/yyyy';
  y: string = 'yyyy/mm/dd';
  dateFormate() {
    if (this.date == this.d) {
      this.dd = true;
      this.mm = false;
      this.yy = false;
    } else if (this.date == this.m) {
      this.mm = true;
      this.dd = false;
      this.yy = false;
    } else if (this.date == this.y) {
      this.yy = true;
      this.dd = false;
      this.mm = false;
    }
  }
  constructor(
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private authService: AuthService,
    private fb: FormBuilder,
    public rbac: RbacService,
  ) {}

  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
  initializeForm() {
    this.leaveForm = this.fb.group({
      leaveType: [null, Validators.required],
      startdate: [null, Validators.required],
      enddate: [null, Validators.required],
      availing: [{value : '',disabled: true}], 
      fulldayavailing: [{value : '',disabled: true}], 
      reason: ['', [Validators.required]]
    });
    this.leaveForm.get('startdate')?.valueChanges.subscribe(() => this.updateHalfDayOptions());
    this.leaveForm.get('enddate')?.valueChanges.subscribe(() => this.updateHalfDayOptions());
    
  }
  // noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  //   const isWhitespace = (control.value || '').trim().length === 0;
  //   return isWhitespace ? { whitespace: true } : null;
  // }
  updateHalfDayOptions() {
    const start = this.leaveForm.get('startdate')?.value;
    const end = this.leaveForm.get('enddate')?.value;

    if (start && end) {
      this.leaveForm.get('halfDay')?.enable();
      this.leaveForm.get('availing')?.enable();
      this.leaveForm.get('fulldayavailing')?.enable();

    } else {
      this.leaveForm.get('halfDay')?.disable();
      this.leaveForm.get('availing')?.disable();
      this.leaveForm.get('fulldayavailing')?.disable();
     
    }
  }

  onRowsChange() {
    this.first = 0;

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }
  getCategoryDetails() {
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${this.empdata.employeeId}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categoryDetails = response.data as ICategoryDetails[]
          
          
          this.calculateProbationLeavs(this.categoryDetails);
          this.logOptionalLeaveDays(this.categoryDetails);
        }
      },
      error: (reason: any) => {
        console.log(reason);
        
      },
      complete: () => { }
    })
  }

  getEmployeeid(){
    
    this.subscription = this.http.getData(`Employeedata/${this.empdata.employeeId}`).subscribe({
      next: (data: any) => {
        
        this.employeeiddetails = data;
        this.calculateProbationLeavs(this.categoryDetails);
        
      },
    });
  }
  checkPreviousOptionalLeaves() {
   
    if (!this.optionalHolidays) {
      console.error('Optional holidays data is not available.');
      return;
    }
    if (!this.lpdata) {
      console.error('Leave data (lpdata) is not available.');
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
      // Logic for blocking leave requests if remainingOptionalHolidays matches optionalLeaveAllowedDays
      if (remainingOptionalHolidays <= this.optionalLeaveAllowedDays) {
        this.mustUseOptLevs = true;
      }
    } else {
      console.error('optionalLeaveAllowedDays is undefined.');
    }
  }
  
  calculateProbationLeavs(categoryDetails: ICategoryDetails[]) {
    if (this.employeeiddetails.probationEndDate) {
      // Check if the employee is still on probation
      let currentDate = moment();
      

      let probationEndDate = moment(this.employeeiddetails.probationEndDate);
   

      // Create new Moment objects without time information
      let currentDateWithoutTime = currentDate.startOf('day');
      let probationEndDateWithoutTime = probationEndDate.startOf('day');

      if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
        // The employee is still on probation
        

        // Calculate the number of probation days
        let dateOfJoining = moment(this.employeeiddetails.dateOfJoining);
        

        let probationDays = currentDate.diff(dateOfJoining, 'days');
       

        // Divide by 30 and round down to the nearest 0.5 or whole number
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
      console.log("'Optional Holiday' category not found.");
    }
  }


  onleaveSelect(categoryId: number) {
    this.leaveFormData.categoryId = categoryId;

    this.isSubmitted = false;
    this.selectedleave = this.categoryDetails.find(c => c.category.id == categoryId) as ICategoryDetails
    // this.enableHalfDayOptions = this.selectedleave?.category?.allowedHalfDay ?? false;
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.excludeHolidays) {
      this.getholidaybyempid();
    }
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.excludeWeekends) {
      this.getweekendbyempid();
    }
    const maxDays = this.selectedleave?.allowedDays;
    const leavesTaken = this.selectedleave?.utilizedDays;
    const booked = this.selectedleave?.booked; // If no booked days, default to 0
    // Calculate remaining leaves by subtracting utilized and booked days from allowed days
    this.remainingLeaves = maxDays - (leavesTaken ? leavesTaken : 0) - booked;
    // Log the result for debugging
    // Handle probation leave balance if applicable
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.isProbationAllowed) {
      const probationLeavesTaken = this.selectedleave.probationLeaves - (leavesTaken !== undefined ? leavesTaken : 0) - booked;

      // Update remaining leaves for probation
      if (probationLeavesTaken >= 0) {
        this.remainingLeaves = probationLeavesTaken;
      } else {
        this.remainingProbationLeaves = 0;
      }
    } else {
      this.remainingProbationLeaves = 0;
    }
    // Call calculateDateDifference function here
    if (this.startDate && this.endDate) {
      this.calculateDateDifference(this.startDate, this.endDate);
    }
    setTimeout(() => {
      if (this.startDate?.control) { // Ensure control exists
      }
    });
  }
  
  onstartdate(action: string) {
    this.updateStartDateValidity1();
    this.vldateofjoin1();
    this.onEndDateChange();
    this.checkWeekends(action);
    this.dateCheckWithHolidayOrWeekend(action);
    this.issEndDategreater = true;
  //   if (!this.startDate) {
  //     // Clear the end date when the start date is cleared
  //     this.endDate = null;

  //     // Optionally reset any errors or validations tied to the end date
  //     this.isWeekOffSelectedEndate = false; // Example: Resetting the weekend error
  //     this.isHolidaySelectedEndate = false; // Example: Resetting the holiday error
  //      // Example: Resetting "End Date should be greater than Start Date" error
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
    //this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (this.startDate < this.empdata.dateOfJoining) {
      this.isstimeoffValid = false;
    } else {
      this.isstimeoffValid = true;
    }
  }
  
  onEndDateChange() {
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
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
      // selectedDate = moment(this.selectedfields.startdate);
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
  isHolidaySelected = false
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
    // if (action == 'update') {
    //   selectedDate = moment(this.selectedfields.startdate);
    // }
    if (this.orgholidays?.orgHolidaysItems && !this.selectedleave?.category?.isOptionalHoliday) {
      this.orgholidays.orgHolidaysItems.forEach((element: any) => {
        const currentDate = moment(element.holidayDate);
        // if(element.isOptional!=true){
        element.holidayDate = currentDate.format('YYYY-MM-DD');
        // }
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
      // Check if any date in the range is NOT an optional holiday (i.e., a working day)
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return this.orgholidays.orgHolidaysItems?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
      this.isHolidaySelected = isDatePresent;
      // this.isHolidaySelected=isDateenddatePresent;
      //this.isHolidaySelected=isWorkingDayBetweenDates;
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
      // Check if any date in the range is NOT an optional holiday (i.e., a working day)
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return filteredData?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
      // this.isHolidaySelected = isDatePresent;
      this.isoptionalnotallowedatWorkingdate=isDatePresent;
      //this.isHolidaySelected=isWorkingDayBetweenDates;
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
    // if (action == 'update') {
    //   selectedDate = moment(this.selectedfields.startdate);
    // }
    if (this.orgholidays?.orgHolidaysItems && !this.selectedleave?.category?.isOptionalHoliday) {
      this.orgholidays.orgHolidaysItems.forEach((element: any) => {
        const currentDate = moment(element.holidayDate);
        // if(element.isOptional!=true){
        element.holidayDate = currentDate.format('YYYY-MM-DD');
        // }
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
      // Check if any date in the range is NOT an optional holiday (i.e., a working day)
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return this.orgholidays.orgHolidaysItems?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });
      // this.isHolidaySelected = isDatePresent;
      this.isHolidaySelectedEndate=isDateenddatePresent;
      //this.isHolidaySelected=isWorkingDayBetweenDates;
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
      // Check if any date in the range is NOT an optional holiday (i.e., a working day)
      let isWorkingDayBetweenDates = dateRange?.some(date => {
        return filteredData?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
      });

      // this.isHolidaySelected = isDatePresent;
      this.isoptionalnotallowedatWorkingdate=isDateenddatePresent;
      //this.isHolidaySelected=isWorkingDayBetweenDates;
    }
  }
  onStartDateChange() {
    // Set the min and max for the end date based on the selected start date
    
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
        console.log(err);
      }
    })
    
  }
 
  onEndDate(action: string) {
    this.onEndDateChange();
    this.updateEndDateValidity();
    this.updateStartDateValidity1();
    this.checkWeekendsEndate(action);
    this.dateCheckWithHolidayOrWeekendForEndDateChange(action);
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

    console.log(this.selectedDay);
    console.log(this.orgweekend.orgWeekendItems);

    let captureHoliday: any;
    const dayPresent = this.orgweekend.orgWeekendItems?.some((holiday: any) => {
      if (holiday.weekday === this.selectedDay) {
        captureHoliday = holiday;
        return true;
      }
      this.isWeekOffSelectedEndate = false;
      return false;
    });

    console.log(captureHoliday);
    if (captureHoliday && dayPresent) {
      if (weekNumber === 1 && dayPresent) {
        if (captureHoliday.firstweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
        console.log("First week of the month");
      } else if (weekNumber === 2 && dayPresent) {
        if (captureHoliday.secondweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
        console.log("Second week of the month");
      } else if (weekNumber === 3) {
        if (captureHoliday.thirdweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
        console.log("Third week of the month");
      } else if (weekNumber === 4) {
        if (captureHoliday.fourthweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
        console.log("Fourth week of the month");
      } else if (weekNumber === 5) {
        if (captureHoliday.fifthweek) {
          this.isWeekOffSelectedEndate = true;
        } else {
          this.isWeekOffSelectedEndate = false;
        }
        console.log("Fifth week of the month");
      }
    }
    console.log(this.isWeekOffSelectedEndate);
  }
  getcustompolicybyempid() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    console.log(empdata.employeeId);

    this.subscription = this.http.getData(`LeavePolicy/${empdata.employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.custompolicyleaves = data;
        console.log(this.custompolicyleaves);


      }
    })
  }

 
  getLeavesData() {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    console.log(empdata.employeeId);
    this.subscription = this.http.getData(`Timeoff/${empdata.employeeId}`).subscribe({
      next: (response: any) => {
        console.log(response);

        this.leavedatatimeoff = response;
        console.log(this.leavedatas);

        this.getDataByLPID()
      },
      error: (reason: any) => console.log(reason)

    })
  }
  
  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/LPID/${empid}`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.lpdata = response;
        console.log(this.lpdata); // the response data stored in the lpdata variable

        // Reset counts
        this.waitingforapprovalCount = 0;
        this.draftsCount = 0;
        this.approvedCount = 0;
        this.rejectedCount = 0;
        this.processedCount = 0;
        this.cancelledCount = 0;
        this.waitingForApprovalLeaves = [];
        this.draftLeaves = [];
        this.approvedLeaves = [];
        this.rejectedLeaves = [];
        this.processedLeaves = [];
        this.cancelledLeaves = [];
        // Add existing counts
        this.lpdata.forEach((element: { status: string }) => {
          if (element.status === 'Waiting for Approval') {
            this.waitingforapprovalCount++;
            this.waitingForApprovalLeaves.push(element);
          }
          if (element.status === 'Draft') {
            this.draftsCount++;
            this.draftLeaves.push(element);
          }
          if (element.status === 'Approved') {
            this.approvedCount++;
            this.approvedLeaves.push(element);
          }
          if (element.status === 'Rejected') {
            this.rejectedCount++;
            this.rejectedLeaves.push(element);
          }
          if (element.status === 'Processed') {
            this.processedCount++;
            this.processedLeaves.push(element);
          }
          if (element.status === 'Cancelled') {
            this.cancelledCount++;
            this.cancelledLeaves.push(element);
          }
        });

        // Check if optionalHolidays is defined before accessing its length
        if (this.optionalHolidays) {
          let totalOptionalHolidays = this.optionalHolidays.length;
          console.log('Total Optional Holidays:', totalOptionalHolidays);

          // Initialize variables
          this.optLevsUsed = 0; // Track how many optional holidays are booked with "Optional Holiday"
          let otherCategoriesUsed = 0; // Track how many optional holidays are booked with other categories

          // Iterate over lpdata to adjust the used "Optional Holiday"
          this.lpdata.forEach((leave: any) => {
            let leaveDate = moment(leave.startdate).format('YYYY-MM-DD');
            let isOptionalHoliday = this.optionalHolidays?.some(
              (holiday: any) => moment(holiday.holidayDate).format('YYYY-MM-DD') === leaveDate
            );
            if (isOptionalHoliday) {
              if (leave.categoryName === 'Optional Holiday') {
                this.optLevsUsed += leave.duration; // Add duration to optLevsUsed
              } else {
                otherCategoriesUsed += leave.duration;
                console.log(
                  `Optional holiday on ${leaveDate} booked with ${leave.categoryName}.`
                );
              }
            }
          });

          console.log('"Optional Holiday" used:', this.optLevsUsed);
          console.log('Optional holidays booked with other categories, total duration:', otherCategoriesUsed);


          // Ensure optionalLeaveAllowedDays is defined
          if (this.optionalLeaveAllowedDays !== undefined && this.optionalLeaveAllowedDays !== null) {
            let remainingOptionalHolidays = totalOptionalHolidays - otherCategoriesUsed;
            console.log('Remaining Optional Holidays:', remainingOptionalHolidays);
  
            console.log('Optional leave allowed days:', this.optionalLeaveAllowedDays);
  
            // Logic for blocking leave requests if remainingOptionalHolidays matches optionalLeaveAllowedDays
            if (remainingOptionalHolidays <= this.optionalLeaveAllowedDays) {
              console.log('You must use "Optional Holiday" category for remaining optional holidays.');
            }
          } else {
            console.error('optionalLeaveAllowedDays is undefined.');
          }
        } else {
          console.error('optionalHolidays is undefined.');
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  getOrgHolidaysByEmpId(): any {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    console.log(empdata.employeeId);
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${empdata.employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.custompolicyleaves = data;
        this.optionalHolidays = this.custompolicyleaves?.orgHolidaysItems.filter((item: { isOptional: boolean }) => item.isOptional);
        this.optionalHolidayCount = this.optionalHolidays.length;
        this.blockDates = this.custompolicyleaves?.orgHolidaysItems.map((item: { holidayDate: any }) => item.holidayDate);
        this.blockDates.find((item: any) => {
          this.blockedData = this.formatDate(item)
          console.log(this.blockedData);
        })
        console.log(this.blockDates)
        console.log(this.optionalHolidays);
        console.log('Total Optional Holidays:', this.optionalHolidayCount);
        console.log(this.custompolicyleaves);
      }
    })
  }
 
  getallpolicy() {
    this.subscription = this.http.getData("LeavePolicy/getall").subscribe({
      next: (data: any) => {
        console.log(data);
        this.allPolicy = data as ILeaves[];
        localStorage.setItem("getGradedata", JSON.stringify(data));

      },
      error: reason => console.log(reason)
    });
  }
  getEmployementTypeByempId(empid: number) {
    this.subscription = this.http.getData(`Employementtype/${empid}`).subscribe({
      next: (res: any) => {

        console.log(res);
        let sortedresponse = res.sort((a: any, b: any) => {
          if (a.empEffectiveDate < b.empEffectiveDate) {
            return -1;
          }
          if (a.empEffectiveDate > a.empEffectiveDate) {
            return 1;
          }

          // names must be equal
          return 0;
        })

        console.log(sortedresponse);
        let gradeid = sortedresponse[sortedresponse.length - 1].gradeId
        console.log(gradeid);
        this.getLeavePoliciesbygradeId(gradeid)
      }
    })

  }
  
  getLeavePoliciesbygradeId(gradeId: number) {
    this.subscription = this.http.getData(`LeavePolicy/getbygradeid/${gradeId}`).subscribe({
      next: (res: any) => {
        this.leavedata = res as ILeaves[];
        var joiningDate = new Date(this.empdata.dateOfJoining)//joining date
        //getting year from joining date
        const joiningYear = joiningDate.getFullYear()
        //getting current date
        const presentDate = new Date();
        //getting year from current date to compare the joining year
        const presentYear = presentDate.getFullYear()
        //comparing joining year from the present year
        if (presentYear == joiningYear) {
          //getting joining month from dateofjoining to calculate remaning days
          const joiningMonth = (joiningDate.getMonth() + 1);
          //calculating remaining days
          const remainingDays = (12 - joiningMonth) * 21;
          //looping leave data to calculate to change the max days
          this.leavedata.forEach((leavs: ILeaves) => {
            leavs.maxDays = Math.round((leavs.maxDays * remainingDays) / 252)
          });
        }
        this.getLeaveTakenByEmpId();
        // Saving leavedata to local storage
        // localStorage.setItem('leavedata', JSON.stringify(this.leavedata));
        // // Extracting categoryName and lpId and storing in array
        // this.categoryLPIds = this.leavedata.map(item => ({categoryName: item.categoryName, lpId: item.lpId}));
        // console.log(this.categoryLPIds);
      }
    });
  }
  getLeaveTakenByEmpId() {
    let LBEId = this.empdata.employeeId;

    this.subscription = this.http.getData(`LeaveBalance/getbyid/${LBEId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        // Group leave taken data by leavePolicyId and sum up leavesTaken for each leavePolicyId
        const groupedData = data.reduce((acc: any, curr: any) => {
          console.log(acc);
          console.log(curr);


          if (acc[curr.leavePolicyId]) {
            acc[curr.leavePolicyId].leavesTaken += curr.leavesTaken;
          } else {
            acc[curr.leavePolicyId] = curr;
          }
          return acc;
        }, {});

        // Convert the groupedData object into an array and assign it to Leavestaken
        this.Leavestaken = Object.values(groupedData) as ILeavesTaken[];
        console.log(this.Leavestaken);

        // this.custompolicyleaves.forEach((custompolicy: any) => {
        //   this.leavedata.push(custompolicy)
        // });
        console.log(this.leavedata);


        this.leavedata.forEach((leaves: ILeaves) => {
          this.Leavestaken.forEach((leavetaken: ILeavesTaken) => {
            if (leavetaken.leavesTaken && leaves.lpId == leavetaken.leavePolicyId) {
              leaves.leavesTaken = leavetaken.leavesTaken
            } else {
              leaves.leavesTaken = 0
            }
          })
        })

        this.fusionMadatoryLeavsValidation()


        // Log the Leavestaken object to the console
        console.log(this.Leavestaken);

        // Assuming the `leavedata` variable contains an array of objects with `maxDays` and `leavesTaken` properties
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

    console.log(this.leavedata);

    let paidLeaveCategory = this.leavedata.find((leave: ILeaves) => leave.categoryId === PAID_LEAVE_CATAGOEY_ID) as ILeaves

    let isPaidLeavesExpired = paidLeaveCategory?.leavesTaken == paidLeaveCategory?.maxDays

    console.log(isPaidLeavesExpired);

    if (!isPaidLeavesExpired) {
      this.leavedata = this.leavedata.filter((leave: ILeaves) => leave.categoryId != MANDATORY_LEAVE_CATAGOEY_ID)
    }

  }
  calculateDateDifference(startDate: string, endDate: string) {
    var date1 = moment(startDate, 'YYYY-MM-DD');
    var date2 = moment(endDate, 'YYYY-MM-DD');

    // Calculate the difference in days
    var days = date2.diff(date1, 'days');
    console.log(days);

    const start = moment(startDate);
    const end = moment(endDate);
    let diff = days + 1;
    // console.log(diff);

    // Loop through each day in the range and subtract any Saturdays, Sundays or Holidays
    let currentDate = start;
    while (currentDate <= end) {
      if (this.selectedleave && this.selectedleave.category) {
        if (this.selectedleave.category.excludeWeekends) {
          // Check if the current day is a weekend based on the data from the API
          if (this.orgweekend?.orgWeekendItems?.some((item: any) => item.weekday === currentDate.format('dddd'))) {
            diff -= 1; // Subtract one day (in milliseconds) for each weekend day
          }
        }
        console.log(this.orgholidays?.orgHolidaysItems);

        if (this.selectedleave?.category.excludeHolidays && !this.selectedleave.category.isOptionalHoliday) {
          this.isoptionalnotallowedatWorkingdate = false;
          let filteredholidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => {
            return ele.isOptional != true
          })
          //  console.log(filteredholidays);

          if (filteredholidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(currentDate))) {
            diff -= 1; // Subtract one day (in milliseconds) for each holiday
          }
        }
        else {
          diff -= 0;
        }
        if (this.orgholidays?.orgHolidaysItems?.some((holiday: any) => moment(holiday.holidayDate).isSame(startDate, 'day') && (holiday.isOptional === false || holiday.isOptional === null))) {
          this.isNonOptionalHolidaySelected = true;
        } else {
          this.isNonOptionalHolidaySelected = false;
        }
        let nonOptionalHolidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => ele.isOptional === false || ele.isOptional == null);
        if (nonOptionalHolidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(endDate, 'day'))) {
          this.isHolidaySelectedEndate = true; 
          this.isHolidaySelected = true;// Set the flag if end date is a non-optional holiday
        } else {
          this.isHolidaySelectedEndate = false;
          
        }
        if (this.selectedleave.category.isOptionalHoliday) {
          let filteredholidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => {
            return ele.isOptional == true
          })
          // Create a range of dates from start to end
          let dateRange = [];
          for (let m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
            dateRange.push(m.format('YYYY-MM-DD'));
          }

          // Check if any date in the range is NOT an optional holiday (i.e., a working day)
          let isOptionalHolidayBetweenDates = dateRange?.some(date => {
            return !filteredholidays?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'));
          });

          //  Check if start date is an optional holiday
          const isStartOptionalHoliday = this.orgholidays?.orgHolidaysItems?.some((holiday: any) => {
            return moment(holiday.holidayDate).isSame(startDate, 'day') && holiday.isOptional === true;
          });

          //  Check if end date is an optional holiday
          const isEndOptionalHoliday = this.orgholidays?.orgHolidaysItems?.some((holiday: any) => {
            return moment(holiday.holidayDate).isSame(endDate, 'day') && holiday.isOptional === true;
          });

          // Check if either the start date or the end date is a working day when the other is selected as an optional holiday
          if (isOptionalHolidayBetweenDates) {
            // Both start date and end date are working days, and end date is on or after start date, so throw an error
            this.isoptionalnotallowedatWorkingdate = true;
          }
          else if (!isStartOptionalHoliday) {
            this.isoptionalnotallowedatWorkingdate = true;
          }
          else if (!isEndOptionalHoliday) {
            this.isoptionalnotallowedatWorkingdate = true;
          }
          else {
            // All other cases are allowed
            this.isoptionalnotallowedatWorkingdate = false;
          }
        }
        else {
          this.isoptionalnotallowedatWorkingdate = false;
        }



      }
      currentDate = currentDate.add(1, 'day');
    }
    if (endDate != null) {
      this.dateDifference = diff;
      console.log(this.dateDifference);
      if (this.dateDifference > 1) {
        this.chooseDayType("full");
      }
      else if (this.dateDifference <= 1) {
        this.isDayTypeselected = false;
        this.selectedValuehalf = false;
        this.enableButton = false;
      }

      // Set the value of dateDiff based on isHalfDay
      this.dateDiff = this.leaveFormData.isDaytype ? this.dateDifference / 2 : this.dateDifference;
      console.log(this.dateDiff);

    }
  }
  chooseDayType(daytype: any) {
    this.isSubmitted = false;
    this.isDayTypeselected = true;
    if (daytype === 'half') {
      this.leaveFormData.isDaytype = true;
      this.leaveForm.patchValue({ fulldayavailing: null });
      this.enableButton = true;
      if(this.leaveForm.get('availing')?.value === 'firsthalf'){
        this.selectedValue = '1'
      }
      if(this.leaveForm.get('availing')?.value === 'secondhalf'){
        this.selectedValue = '3'
      }
    }
    else if (daytype === 'full') {
      this.leaveFormData.isDaytype = false;
      this.enableButton = false;
      this.toggleFullDayOptions(false);
      if(this.dateDiff > 1){
        this.leaveForm.get('availing')?.disable();
        this.leaveForm.patchValue({ fulldayavailing: '2' });
      }
      else{
        this.leaveForm.get('availing')?.enable();
      }
      this.selectedValue = '2'
    }
  }
  isOptionalHoliday(leave: any): boolean {
    // Compare leave start date with optional holiday dates
    const leaveStartDate = moment(leave.startdate); // Assuming moment.js is used for date manipulation
    return this.optionalHolidays?.some((holiday: any) => {
      const holidayDate = moment(holiday.holidayDate); // Assuming holiday date is in the same format as leave start date
      return holidayDate.isSame(leaveStartDate, 'day');
    });
  }

  shouldDisable(item: any) {
    // Check if the category has a parent ID
    if (item.category?.parentId) {
      // Find the parent category
      const parentCategory = this.categoryDetails.find(category => category.category.id === item.category.parentId);
      // Check if the parent category's allowed days are over
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
    this.leaveForm.get('availing')?.clearValidators();
    this.leaveForm.patchValue({ availing: null });
  }

 
  onSubmit() {
      console.log('Starting leave submission process...');
      this.isSubmitted = true;
      this.isLoading = true;
      console.log(this.leaveForm);
      
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
          // Check if the employee is still on probation
          this.getDataByLPID()
          console.log(this.lpdata);
          let currentDate = moment();
          console.log('Current Date:', currentDate);
          let probationEndDate = moment(this.empdata.probationEndDate);
          console.log('Probation End Date:', probationEndDate);
          // Create new Moment objects without time information
          let currentDateWithoutTime = currentDate.startOf('day');
          let probationEndDateWithoutTime = probationEndDate.startOf('day');
          if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
            // The employee is still on probation
            console.log('Employee is still on probation.');
            // Calculate the number of probation days
            let dateOfJoining = moment(this.empdata.dateOfJoining);
            console.log('Date of Joining:', dateOfJoining);
            let startdate = moment(this.startDate);
            console.log('Startdate:', startdate)
            let enddate = moment(this.endDate)
            console.log('enddate:', enddate)
            let Duration = this.leaveFormData.duration
            console.log('Duration:', Duration)
            // console.log('Duration:',duration);
            let probationDaysDiff = startdate.diff(dateOfJoining, 'days');
            console.log('Probation Days:', probationDaysDiff);
            // Divide by 30 and round down to the nearest 0.5 or whole number
            let months = 1;
            months += Math.floor(probationDaysDiff / 30);
            console.log('month Leaves:', months);
            let totalAppliedLeaves = this.lpdata
              .filter(element => element.status !== 'rejected')  // Exclude rejected leaves
              .reduce((acc, element) => {
                let appliedStartdate = moment(element.startdate).startOf('day');
                let appliedEnddate = moment(element.enddate).startOf('day');
                let appliedDuration = appliedEnddate.diff(appliedStartdate, 'days') + 1;
                return acc + appliedDuration;
              }, 0);
            let probationCategoryDetails: ICategoryDetails[] = this.categoryDetails.filter(e => e.category.isProbationAllowed)
            let leaveCategory = this.leaveFormData.categoryId;
            let isProbationLeave = probationCategoryDetails?.some(e => e.category.id == leaveCategory);
            this.DisableSubmitButton = false
          
          }
        }
        const category = this.categoryDetails.find(c => c.category.id === this.selectedleave?.category.id);
    if (category) {
      // Update the booked leaves temporarily (UI-only change)
      category.booked += this.leaveFormData.duration;
      console.log('Leave form data:', this.leaveFormData);
    }
  
    if(category?.category.isOptionalHoliday){
        // Check if the leave request is for an optional holiday
        const isOptHoliday = this.isOptionalHoliday(this.leaveFormData);
        console.log('isOptionalHoliday result:', isOptHoliday);
        if (this.mustUseOptLevs) {
          console.log('Condition met: You must use "Optional Holiday" category for remaining optional holidays.');
          if (isOptHoliday) {
            console.log('Leave request is for an optional holiday.');
            if (this.selectedleave.category.name?.toLowerCase() !== 'optional holiday') {
              const modalElement = document.getElementById('successhide1');
              if (modalElement) {
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                this.Status = 'You must use Optional Holiday category for optional holidays';
              }
              // alert("You must use 'Optional Holiday' category for optional holidays.");
              this.isSubmitted = false;
              console.log('Leave submission blocked: User did not use "Optional Holiday" for optional holiday.');
              return;
            } else {
              console.log('Leave request for optional holiday is correctly using "Optional Holiday".');
              this.optLevsUsed += this.leaveFormData.duration;
              console.log('"Optional Holiday" used:', this.optLevsUsed);
            }
          }
        }
  
        if (isOptHoliday) {
          console.log('Leave request is for an optional holiday.');
          if (this.optionalLeaveAllowedDays !== undefined) {
            console.log('Optional leave allowed days:', this.optionalLeaveAllowedDays);
            if (this.optLevsUsed <= this.optionalLeaveAllowedDays) {
              console.log('Employee has remaining "Optional Holiday" days.');
              if (this.selectedleave.category.name?.toLowerCase() === 'optional holiday') {
                this.optLevsUsed++;
                console.log('"Optional Holiday" used:', this.optLevsUsed);
              } else {
                console.log(`Optional holiday on ${this.leaveFormData.date} booked with ${this.leaveFormData.categoryName}.`);
                this.optLevsUsed--;
                console.log('"Optional Holiday" used:', this.optLevsUsed);
              }
            } else {
              const modalElement = document.getElementById('successhide1');
              if (modalElement) {
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                this.Status = 'You must use Optional Holiday category for optional holidays';
              }
              //  alert("You must use 'Optional Holiday' category for optional holidays.");
              this.isSubmitted = false;
             // console.log('Leave submission blocked: Maximum "Optional Holiday" limit reached.');
              return;
            }
          } 
        } else {
          console.log('Leave request is not for an optional holiday.');
        }
  
        // Check if otherCategoriesUsed exceeds the limit during submission
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
          const modalElement = document.getElementById('successhide1');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          this.Status = 'You must use Optional Holiday category for optional holidays';
        }
          this.isSubmitted = false;
          return;
        } else {
          otherCategoriesUsed += this.leaveFormData.duration;
          console.log(`Optional holiday on ${this.startDate} booked with ${this.leaveFormData.categoryName}, duration: ${this.leaveFormData.duration}.`);
        }
      }
    }
        this.subscription = this.http.postdata("Timeoff", this.leaveFormData).subscribe({
          next: (data: any) => {
            console.log('Leave submission response:', data);
            if (data) {
              this.disableSubmitButton = true;

              console.log('Leave submitted successfully.');
              console.log('Start date:', this.startDate);
              console.log('End date:', this.endDate);
              this.conformationPopup.openSuccessModal(
                'Leave submitted successfully');
              setTimeout( () => {
                this.modalService.dismissAll();
                this.leaveForm.reset();
                window.location.reload();
              }, 2000);
              this.isLoading = false;
            }
          },
          error: (err: any) => {
            console.error('Error occurred while submitting leave:', err);
            this.conformationPopup.openErrorModal(
              err.error.message);
            this.isLoading = true;
            this.isLoading = false;
          }
        });
      } 
      else {
        console.warn('Maximum leave limit reached for this category.');
        const modalElement = document.getElementById('successhide1');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          this.Status = 'Maximum leave limit reached for this category.';
        }
        this.isSubmitted = false;
      }
    }

  cleardata(){
    this.leaveForm.reset();
    this.modalService.dismissAll();
  }
  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
