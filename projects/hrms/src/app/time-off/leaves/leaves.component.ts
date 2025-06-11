import { Component, effect, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ICategoryDetails, ILeaves, Ileavesdatas, ILeavesTaken, Ilpid } from '../../Interfaces/timoff-model';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import moment from 'moment';
import { environment } from '../../../environments/environment';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { LeavesApprovaltabsComponent } from "../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";
import { SignalsService } from '../../services/signals.service';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { ChartModule } from 'primeng/chart';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { FormValidationsService } from '../../services/form-validations.service';
import { Skeleton } from 'primeng/skeleton';
@Component({
  selector: 'app-leaves',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, Select,Skeleton,RouterModule, ReactiveFormsModule, TranslateModule, LeavesApprovaltabsComponent, TabsModule, ChartModule, ModuleInformationComponent],
  templateUrl: './leaves.component.html',
  styleUrl: './leaves.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class LeavesComponent {
  moduleinfo: string = '';
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
  //graph
  leaveCategoryData: any;
  leaveCategoryOptions: any;
  loadingGraph: boolean = false;
  constructor(
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private authService: AuthService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public router: Router,
    public formsValidation: FormValidationsService,
    private signalService: SignalsService) {
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

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getCategoryDetails();
    this.initializeForm();
    this.getEmployeeid();
    this.getholidaybyempid();
    this.getcustompolicybyempid();
    this.getOrgHolidaysByEmpId();
    this.getallpolicy();
    this.getgradedata = JSON.parse(localStorage.getItem("getGradedata") || '{}');

    this.getweekendbyempid()
    this.checkPreviousOptionalLeaves();
    this.getTeamManagersDetails();
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.leaveForm.get('startdate')?.valueChanges.subscribe((startDate: string) => {
    this.minEndDate = startDate; // Set min for enddate input
    this.leaveForm.get('enddate')?.updateValueAndValidity(); // Optional: trigger validation
  });
  }

  draftsCount = 0;
  waitingforapprovalCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  processedCount = 0;
  cancelledCount = 0;
  disaplyapplybutton = true;
  onCheckemployee(employeedId: any) {
    this.http.setEmployeeIdTimeoff(employeedId); //
    this.waitingforapprovalCount = 0;
    this.rejectedCount = 0;
    this.approvedCount = 0;
    this.processedCount = 0;
    this.cancelledCount = 0;
    this.lpdata = [];
    if (employeedId) {
      this.disaplyapplybutton = false;
      this.getDataByLPID(employeedId);
      this.getLeavesData(employeedId);
      this.getCategoryempDetails(employeedId);
    } else {
      this.http.setEmployeeIdTimeoff(null);
      this.disaplyapplybutton = true;
      this.getLeavesData(this.empdata.employeeId);
      this.getDataByLPID(this.empdata.employeeId);
      this.getCategoryDetails();
    }
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/leaves': MODULE_INFOS.TIME_OFF_LEAVES_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getDataByLPID(employeeId: any) {
    let empid = employeeId;
    this.subscription = this.http.getData(`Timeoff/LPID/${empid}`).subscribe({
      next: (response: any) => {
        this.lpdata = response;
        // Reset counts
        this.waitingforapprovalCount = 0;
        this.draftsCount = 0;
        this.approvedCount = 0;
        this.rejectedCount = 0;
        this.processedCount = 0;
        this.cancelledCount = 0;
        // Add existing counts
        this.lpdata.forEach((element: { status: string }) => {
          if (element.status === 'Waiting for Approval') {
            this.waitingforapprovalCount++;
          }
          if (element.status === 'Draft') {
            this.draftsCount++;
          }
          if (element.status === 'Approved') {
            this.approvedCount++;
          }
          if (element.status === 'Rejected') {
            this.rejectedCount++;
          }
          if (element.status === 'Processed') {
            this.processedCount++;
          }
          if (element.status === 'Cancelled') {
            this.cancelledCount++;
          }
        });
        // Check if optionalHolidays is defined before accessing its length
        if (this.optionalHolidays) {
          let totalOptionalHolidays = this.optionalHolidays.length;
          // Initialize variables
          this.optLevsUsed = 0; // Track how many optional holidays are booked with "Optional Holiday"
          let otherCategoriesUsed = 0; // Track how many optional holidays are booked with other categories
          // Iterate over lpdata to adjust the used "Optional Holiday"
          this.lpdata.forEach((leave: any) => {
            let leaveDate = moment(leave.startdate).format('YYYY-MM-DD');
            let isOptionalHoliday = this.optionalHolidays.some(
              (holiday: any) => moment(holiday.holidayDate).format('YYYY-MM-DD') === leaveDate
            );
            if (isOptionalHoliday) {
              if (leave.categoryName === 'Optional Holiday') {
                this.optLevsUsed += leave.duration; // Add duration to optLevsUsed
              } else {
                otherCategoriesUsed += leave.duration;
              }
            }
          });
          // Ensure optionalLeaveAllowedDays is defined
          if (this.optionalLeaveAllowedDays !== undefined && this.optionalLeaveAllowedDays !== null) {
            let remainingOptionalHolidays =
              totalOptionalHolidays - otherCategoriesUsed;
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
      error: (reason: any) => console.log(reason),
    });
  }

  leavedatatimeoff: any;
  leavedatas: any;
  getLeavesData(employeeId: any) {
    let empdata = employeeId;
    console.log(empdata);
    this.subscription = this.http
      .getData(`Timeoff/${empdata}`)
      .subscribe({
        next: (response: any) => {
          this.leavedatatimeoff = response;
          this.getDataByLPID(employeeId);
        },
        error: (reason: any) => console.log(reason),
      });
  }

  // function to get the data of employees by hierarchy
  getEmployeeInfo = [] as any;
  getTeamManagersDetails() {
    const EmployeeId = this.empdata.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response)
          if (response && response.length) {
            // No filter
            const myTeam = response.filter((e: any) => e.isAccess);
            this.getEmployeeInfo = myTeam.map((employee: any) => ({
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
            }));
          }
        },
      });
  }

  navigateOrLeavebalance() {
    this.router.navigate(['/time-off/leaves/org-leave-balance'])
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  initializeForm() {
    this.leaveForm = this.fb.group({
      leaveType: [null, Validators.required],
      startdate: [null, Validators.required],
      enddate: [null, Validators.required],
      halfdayavailing: ['', Validators.required],
      availing: [{ value: '', disabled: true }],
      fulldayavailing: [{ value: '', disabled: true }],
      reason: [null, [Validators.required]]
    });
    this.leaveForm.get('startdate')?.valueChanges.subscribe(() => this.updateHalfDayOptions());
    this.leaveForm.get('enddate')?.valueChanges.subscribe(() => this.updateHalfDayOptions());
  }

  updateHalfDayOptions() {
    const start = this.leaveForm.get('startdate')?.value;
    const end = this.leaveForm.get('enddate')?.value;
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
    this.loadingGraph = true;
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${this.empdata.employeeId}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadingGraph = false;
          this.categoryDetails = response.data as ICategoryDetails[];
          this.calculateProbationLeavs(this.categoryDetails);
          this.logOptionalLeaveDays(this.categoryDetails);
          this.initChart(this.categoryDetails);
        }
      },
      error: (reason: any) => {
        this.loadingGraph = false;
        console.error('Error fetching category details:', reason);
      },
      complete: () => {
        this.loadingGraph = false;
       }
    })
  }

  getCategoryempDetails(employeedId: any) {
    const empdata = employeedId;
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${empdata}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categoryDetails = response.data as ICategoryDetails[];
          this.calculateProbationLeavs(this.categoryDetails);
          this.logOptionalLeaveDays(this.categoryDetails);
          this.initChart(this.categoryDetails);
        }
      },
      error: (reason: any) => {
      },
      complete: () => { }
    })
  }

  get totalAvailableLeaves(): number {
    return this.categoryDetails.reduce((total, item) => {
      if (item.category.isProbationAllowed && item.probationLeaves > 0) {
        return total + (item.probationLeaves - item.utilizedDays - item.booked);
      } else {
        return total + (item.allowedDays - item.utilizedDays - item.booked);
      }
    }, 0);
  }

  initChart(item: any) {
    const data: number[] = [];
    const labels: string[] = [];
    const backgroundColors: string[] = [];
    item.forEach((category: {
      category: any; allowedDays: number; name: string; categoryColor: string;
    }) => {
      data.push(category.allowedDays);
      labels.push(category.category.name);
      backgroundColors.push(category.category.categoryColor);
    });
    this.leaveCategoryData = {
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }
      ]
    };
    this.leaveCategoryOptions = {
      cutout: '70%',
      // borderWidth:'10px',
    };
  }

  getAvailableLeaves(item: any): number {
    if (item.category?.isProbationAllowed && item.probationLeaves > 0) {
      return item.probationLeaves - item.utilizedDays - item.booked;
    } else {
      return item.allowedDays - item.utilizedDays - item.booked;
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
    const available = this.getAvailableLeaves(item);
    const total = item.allowedDays || 1; // Avoid division by zero
    const percentage = Math.max(0, Math.min(available / total, 1)); // Clamp between 0 and 1
    return percentage * 360;
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
      if (remainingOptionalHolidays <= this.optionalLeaveAllowedDays) {
        this.mustUseOptLevs = true;
      }
    } else {
      console.error('optionalLeaveAllowedDays is undefined.');
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
    this.enableButton = false;
    this.leaveForm.get('halfdayavailing')?.setValue(null);
    this.leaveForm.get('availing')?.setValue(null);
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
    if (this.selectedleave?.category?.isOptionalHoliday === true) {
      const startDate = this.leaveForm.get('startdate')?.value;
      const endDateControl = this.leaveForm.get('enddate');
      const halfDayControl = this.leaveForm.get('halfdayavailing');
      if (startDate && endDateControl) {
        endDateControl.setValue(startDate);
        endDateControl.disable();
        halfDayControl?.disable();
        this.disableSubmitButton = false;
        this.leaveForm.patchValue({ fulldayavailing: '2' });
      }
    }
    else {
      const endDateControl = this.leaveForm.get('enddate');
      const halfDayControl = this.leaveForm.get('halfdayavailing');
      if (endDateControl) {
        endDateControl.enable();
        halfDayControl?.enable();
        this.disableSubmitButton = true;
        this.leaveForm.patchValue({ fulldayavailing: null });
      }
    }
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
    // this.isWeekOffSelected = false;
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

  const nonOptionalHolidays = this.orgholidays?.orgHolidaysItems.filter((h: { isOptional: any; }) => !h.isOptional);
  const optionalHolidays = this.orgholidays?.orgHolidaysItems.filter((h: { isOptional: any; }) => h.isOptional);

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
      !optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(date, 'day'))
    );

    const isStartOptional = optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; }) =>
      moment(holiday.holidayDate).isSame(startDate, 'day')
    );

    const isEndOptional = optionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; }) =>
      moment(holiday.holidayDate).isSame(endDate, 'day')
    );

    this.isoptionalnotallowedatWorkingdate = hasNonOptional || !isStartOptional || !isEndOptional;
  }

  // Check if start or end date is a non-optional holiday
  if (nonOptionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(startDate, 'day'))) {
    this.isNonOptionalHolidaySelected = true;
  }

  if (nonOptionalHolidays?.some((holiday: { holidayDate: moment.MomentInput; }) => moment(holiday.holidayDate).isSame(endDate, 'day'))) {
    this.isHolidaySelected = true;
    this.isHolidaySelectedEndate = true;
  }

  // Check optional holiday misuse if optional leave not allowed
  if (this.selectedleave?.category?.isOptionalHoliday === false) {
    const isStartOptional = optionalHolidays?.some((holiday: { holidayDate: any; }) =>
      this.isSameDate(holiday.holidayDate, startDate)
    );

    const isEndOptional = optionalHolidays?.some((holiday: { holidayDate: any; }) =>
      this.isSameDate(holiday.holidayDate, endDate)
    );

    this.startDateErrorMessage = isStartOptional ? 'Selected start date is not allowed as it is an optional holiday' : '';
    this.endDateErrorMessage = isEndOptional ? 'Selected end date is not allowed as it is an optional holiday' : '';

    if (isStartOptional || isEndOptional) {
      return;
    }
  }

  // Set final calculated difference
  this.dateDifference = diff;

  if (diff > 1) {
    this.chooseDayType("full");
  } else {
    this.isDayTypeselected = false;
    this.selectedValuehalf = false;
    this.enableButton = false;
  }

  this.dateDiff = this.leaveFormData.isDaytype ? diff / 2 : diff;
}

  isSameDate(date1: any, date2: any): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  chooseDayType(daytype: any) {
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
            console.log('Leave request is for an optional holiday.');
            if (this.selectedleave.category.name?.toLowerCase() !== 'optional holiday') {
              this.conformationPopup.openErrorModal('You must use Optional Holiday category for optional holidays');
              return;
            } else {
              this.optLevsUsed += this.leaveFormData.duration;
            }
          }
        }
        if (isOptHoliday) {
          console.log('Leave request is for an optional holiday.');
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
    this.enableButton = false;
    this.selectedleave = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}