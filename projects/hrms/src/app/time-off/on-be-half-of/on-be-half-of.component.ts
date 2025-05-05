import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import moment from 'moment';
import { ICategoryDetails, ILeaves, Ileavesdatas, ILeavesTaken, Ilpid, Iorgcategoryleaves, } from '../../Interfaces/timoff-model';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { IJobdetails } from '../../Interfaces/job-model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OnBeHalfOfApprovalTabsComponent } from "../../shared/time-off-module-tabs/on-be-half-of-approval-tabs/on-be-half-of-approval-tabs.component";

@Component({
  selector: 'app-on-be-half-of',
  imports: [CommonModule, RouterModule, TranslateModule, Select, ReactiveFormsModule, OnBeHalfOfApprovalTabsComponent],
  templateUrl: './on-be-half-of.component.html',
  styleUrl: './on-be-half-of.component.scss'
})

export class OnBeHalfOfComponent {
  @ViewChild('halfDayRadio') halfDayRadio: any;
  @ViewChild('fullDayRadio') fullDayRadio: any;
  responseData: Iorgcategoryleaves[] = [];
  subscription!: Subscription;
  empdata = {} as any;
  isSubmitted = false;
  selectedleave = {} as any;
  leavedata = [] as ILeaves[];
  leaveFormData = {} as Ileavesdatas;
  leaveFormNewData = {} as Iorgcategoryleaves;
  filteredLeaves = [] as ILeaves[]
  lpdata = [] as Ilpid[];
  selectedFields = {} as any;
  selectedValue!: string;
  iseditEndDateValid: boolean = true;
  isHalfDay = true;
  istimeoffValid: boolean = true;
  startdatevalid: boolean = true;
  isstimeoffValid: boolean = true;
  issEndDategreater: boolean = true;
  issEndDateValidedd: boolean = true;
  currentDatee = new Date().toISOString().slice(0, 10);
  isDayTypeselected = false
  remainingLeaves!: number;
  dateDifference: number = 0;
  dateDiffedit: number = 0;
  dateDiff: number = 0;
  leavesRemaining: number = 0;
  dateDifferenceedit: number = 0;
  maxDays: number = 0;
  Leavestaken: ILeavesTaken[] = [];
  leavetype = {} as Ileavesdatas;
  book: { [field: number]: number } = {};
  minDate!: string;
  maxDate!: string;
  @ViewChild('updateModal') updateModal!: ElementRef;
  @ViewChild('cardWrapper', { read: ElementRef }) cardWrapper!: ElementRef;
  newBoxes: string[] = [];
  minStartDate!: string;
  maxStartDate!: string;
  minEndDate!: string;
  maxEndDate!: string;
  draftsCount = 0;
  waitingforapprovalCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  processedCount = 0;
  employeeiddetails = [] as any;
  employeeiddetailsauthorityName = [] as any;
  fusionEmployeeId: any
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  isDropdownOpen: boolean = false;
  isDisabled!: boolean;
  isDropdownOpenauthority: boolean = false;
  filteredOptions = [] as any;
  leaveapplication = {} as any;
  selecteemployee: any;
  cancelledCount = 0;
  requestedBy: any;
  showcontent: boolean = false;
  showbutton: boolean = false;
  GDID: any;
  getgradedata = {} as any;
  categoryDetails = [] as ICategoryDetails[]
  orgholidays: any;
  orgweekend: any;
  Status!: string;
  jobdetails = {} as IJobdetails;
  employeesclick: any;
  leaveForm!: FormGroup;
  DisableSubmitButton = false
  isHolidaySelected = false
  enableButton: boolean = false;
  selectedValuehalf: string = '';
  status: boolean = true;
  empiIdAftersubmission: any;
  disableSubmitButton = false
  isWeekOffSelected = false
  isWeekOffSelectedEndate = false
  selectedDay = ''
  enableHalfDayOptions: boolean = true;
  remainingProbationLeaves: number = 0;
  startDate: any;
  endDate: any;
  isLoading: boolean = false;
  isEndDateBeforeStart: boolean = false;
  isoptionalnotallowedatWorkingdate: boolean = false;
  isNonOptionalHolidaySelected: boolean = false;
  isHolidaySelectedEndate: boolean = false;
  blockDates: any;
  blockedData: any;

  constructor(
    private conformationPopup: OpenModalService, 
    private modalService: NgbModal,
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private http: HttpService,
  ) {
    const today = new Date();
    this.minStartDate = today.toISOString().split('T')[0];
    let currentYear = new Date().getFullYear();
    this.maxStartDate = `${currentYear + 1}-12-31`;
    this.minEndDate = this.minStartDate;
    this.maxEndDate = this.maxStartDate;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getEmployeeId();
    localStorage.removeItem('onbehalfof')
    this.getgradedata = JSON.parse(localStorage.getItem("getGradedata") || '{}');
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getEmployementTypeByempId(this.empdata.employeeId)
  }

  initializeForm() {
    this.leaveForm = this.fb.group({
      leaveType: [null, Validators.required],
      startdate: [null, Validators.required],
      enddate: [null, Validators.required],
      halfdayavailing : ['', Validators.required],
      availing: [{value : '',disabled: true}], 
      fulldayavailing: [{value : '',disabled: true}],
      reason: ['', [Validators.required,Validators.maxLength(250)]],
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

  // Onclick(fusionemployeeId: any) {
  //   this.empiIdAftersubmission = fusionemployeeId;
  //   this.showcontent = true;
  //   this.showbutton = true;
  //   this.fusionEmployeeId = fusionemployeeId;
  //   this.leaveapplication = {};
  //   this.leaveapplication = this.employeeiddetails.find(
  //     (c: any) => c.employeeId == fusionemployeeId.value
  //   );
  //   this.disablebuttonforemployeeid = true;
  //   this.leaveapplication.dateOfJoining = this.formatDatewithDate(this.leaveapplication?.dateOfJoining);
  //   this.getCategoryDetails(fusionemployeeId.value);
  //   this.cadidateEmployeeId = fusionemployeeId.value;
  //   this.getOrgHolidaysByEmpId(fusionemployeeId.value)
  //   this.getholidaybyempid(fusionemployeeId.value)
  //   this.getcustompolicybyempid(fusionemployeeId.value);
  //   this.getLeavesData(fusionemployeeId.value);
  //   localStorage.setItem('onbehalfof',fusionemployeeId.value)
  //   this.http.triggerActionSignal();
  // }
  Onclick(fusionemployeeId: any): void {
    if (!fusionemployeeId || !fusionemployeeId.value) {
      // Employee deselected (cleared)
      this.resetOnBehalfOfData();
      return;
    }
  
    // When employee is selected
    this.empiIdAftersubmission = fusionemployeeId;
    this.showcontent = true;
    this.showbutton = true;
    this.fusionEmployeeId = fusionemployeeId;
    this.leaveapplication = {};
    this.leaveapplication = this.employeeiddetails.find(
      (c: any) => c.employeeId == fusionemployeeId.value
    );
    this.disablebuttonforemployeeid = true;
    this.leaveapplication.dateOfJoining = this.formatDatewithDate(this.leaveapplication?.dateOfJoining);
    this.getCategoryDetails(fusionemployeeId.value);
    this.cadidateEmployeeId = fusionemployeeId.value;
    this.getOrgHolidaysByEmpId(fusionemployeeId.value);
    this.getholidaybyempid(fusionemployeeId.value);
    this.getcustompolicybyempid(fusionemployeeId.value);
    this.getLeavesData(fusionemployeeId.value);
    localStorage.setItem('onbehalfof', fusionemployeeId.value);
    this.http.triggerActionSignal();
  }
  
  resetOnBehalfOfData(): void {
    this.empiIdAftersubmission = null;
    this.fusionEmployeeId = null;
    this.leaveapplication = {};
    this.showcontent = false;
    this.showbutton = false;
    this.disablebuttonforemployeeid = false;
    this.categoryDetails = [];
    this.cadidateEmployeeId = 0;
    localStorage.removeItem('onbehalfof');
  }
  
  onleaveSelect(categoryId: number) {
    this.leaveFormData.categoryId = categoryId;
    this.isSubmitted = false;
    this.selectedleave = this.categoryDetails.find(c => c.category.id == categoryId) as ICategoryDetails
    this.enableHalfDayOptions = this.selectedleave?.category?.allowedHalfDay ?? false;
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.excludeHolidays) {
      this.getholidaybyempid(this.empdata.employeeId);
    }
    if (this.selectedleave && this.selectedleave.category && this.selectedleave.category.excludeWeekends) {
      this.getweekendbyempid(this.empdata.employeeId);
    }
    const maxDays = this.selectedleave?.allowedDays;
    const leavesTaken = this.selectedleave?.utilizedDays;
    const booked = this.selectedleave?.booked; // If no booked days, default to 0
    // Calculate remaining leaves by subtracting utilized and booked days from allowed days
    this.remainingLeaves = maxDays - (leavesTaken ? leavesTaken : 0) - booked;
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

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
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

  getEmployeeId() {
    let loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data.filter((element: any) => element.employeeId != loggedInUser.employeeId)
          .map((employee: any) => ({
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
            }${employee.firstName ? employee.firstName : '' } ${employee.middleName ? employee.middleName + ' ' : ''
            }${employee.lastName ? employee.lastName : ''}`,
        }));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  cadidateEmployeeId!: number;
  Onclickemployeeid(Value: any) {
    if (Value == "") {
      this.disablebuttonforemployeeid = true;
    }
    else {
      this.disablebuttonforemployeeid = false;
    }
    let employeeinfo = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == Value
    );
    if (Value != employeeinfo && employeeinfo != undefined) {
      this.disablebuttonforemployeeid = false;
    }
  }

  private formatDatewithDate(date: Date): string | void {
    if (date) {

      return moment(date).format('YYYY-MM-DD');
    }
  }

  getCategoryDetails(employeeId: number) {
    console.log(employeeId)
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${employeeId}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categoryDetails = response.data as ICategoryDetails[]

          this.calculateProbationLeavs(this.categoryDetails)
        }
      },
      error: (reason: any) => {

      },
      complete: () => { }
    })
  }

  getholidaybyempid(employeeId: number) {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${employeeId}`).subscribe({
      next: (data: any) => {

        this.orgholidays = data;
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }

  getweekendbyempid(employeeId: number) {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${employeeId}`).subscribe({
      next: (data: any) => {
        this.orgweekend = data;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

 
  getOrgHolidaysByEmpId(employeeId: number): any {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`orgHolidays/getOrgHoliday/${employeeId}`).subscribe({
      next: (data: any) => {
        this.custompolicyleaves = data;
        this.blockDates = this.custompolicyleaves?.orgHolidaysItems.map((item: { holidayDate: any }) => item.holidayDate);
        this.blockDates.find((item: any) => {
          this.blockedData = this.formatDate(item)
        })
      }
    })
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
        let gradeid = sortedresponse[sortedresponse.length - 1].gradeId
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
        // Group leave taken data by leavePolicyId and sum up leavesTaken for each leavePolicyId
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
              leaves.leavesTaken = 0
            }
          })
        })
        this.fusionMadatoryLeavsValidation()
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

  custompolicyleaves: any;
  getcustompolicybyempid(employeeId: number) {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`LeavePolicy/${employeeId}`).subscribe({
      next: (data: any) => {
        this.custompolicyleaves = data;
      }
    })
  }

  leavedatatimeoff: any;
  leavedatas: any;
  getLeavesData(employeeId: number) {
    let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.subscription = this.http.getData(`Timeoff/${employeeId}`).subscribe({
      next: (response: any) => {

        this.leavedatatimeoff = response;
      },
      error: (reason: any) => console.log(reason)
    })
  }

  calculateProbationLeavs(categoryDetails: ICategoryDetails[]) {
    if (this.leaveapplication.probationEndDate) {
      // Check if the employee is still on probation
      let currentDate = moment();
      let probationEndDate = moment(this.leaveapplication.probationEndDate);
      // Create new Moment objects without time information
      let currentDateWithoutTime = currentDate.startOf('day');
      let probationEndDateWithoutTime = probationEndDate.startOf('day');

      if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
        // The employee is still on probation
        // Calculate the number of probation days
        let dateOfJoining = moment(this.leaveapplication.dateOfJoining);

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

  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
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

  onSubmit() {
    let loggedInUser = this.authService.getToken();
    this.isSubmitted = true;
    if (this.leaveForm.valid) {
      this.dateDiff = this.leaveFormData.isDaytype ? this.dateDifference / 2 : this.dateDifference;
      this.leaveFormData.status = "Processed"
      this.leaveFormData.requestType = "TimeOff"
      let empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
      this.leaveFormData.employeeId = this.leaveapplication.employeeId
      this.leaveFormData.durationType = this.selectedValue;
      this.leaveFormData.duration = this.dateDiff
      this.leaveFormData.requestedBy = loggedInUser.employeeId
      this.leaveFormData.date = moment();
      this.leaveFormData.isdeleted = true
      this.leaveFormData.startdate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
      this.leaveFormData.enddate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
      this.leaveFormData.notes = this.leaveForm.get('reason')?.value
      if (this.leaveapplication.probationEndDate) {
        // Check if the employee is still on probation
        let currentDate = moment();
        let probationEndDate = moment(this.leaveapplication.probationEndDate);
        // Create new Moment objects without time information
        let currentDateWithoutTime = currentDate.startOf('day');
        let probationEndDateWithoutTime = probationEndDate.startOf('day');

        if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
          // The employee is still on probation
          // Calculate the number of probation days
          let dateOfJoining = moment(this.leaveapplication.dateOfJoining);
          let startdate = moment(this.startDate);
          let enddate = moment(this.endDate)
          let Duration = this.leaveFormData.duration
          let probationDaysDiff = startdate.diff(dateOfJoining, 'days');
          // Divide by 30 and round down to the nearest 0.5 or whole number
          let months = 1;
          months += Math.floor(probationDaysDiff / 30);
     
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
          let isProbationLeave = probationCategoryDetails.some(e => e.category.id == leaveCategory);
          this.DisableSubmitButton = false
          if (isProbationLeave) {
            let probationmonths = this.getMonthsArray(new Date(this.empdata.dateOfJoining), new Date(this.empdata.probationEndDate));
            let filterPayrollmonths = probationmonths.filter(x => months >= x.id);
            var prbmnthstartdate = filterPayrollmonths.length == 0 ? filterPayrollmonths[0].startDate : filterPayrollmonths[0].startDate;
            var prbmnthenddate = filterPayrollmonths.length == 0 ? filterPayrollmonths[0].endDate : filterPayrollmonths[filterPayrollmonths.length - 1].endDate;

            //  var SelectedProbCat = probationCategoryDetails.find(x=>x.cate)
            probationCategoryDetails.forEach(e => {
              e.probationLeaves = months * e.category.probationDays
              if (e.probationLeaves >= Duration) {
                if (this.isWithinExistingRanges(prbmnthstartdate, prbmnthenddate, e.probationLeaves, Duration)) {
                  this.DisableSubmitButton = true
                }
                else {
                  this.DisableSubmitButton = false;
                }
              }
              else {
                this.DisableSubmitButton = true;
              }
            })
            if (this.DisableSubmitButton) {
              this.conformationPopup.openErrorModal('Leave application exceeds the allowed limit for the probation Leaves')
              return;
            }
          }
        }
      }
      const differenceInDays = this.calculateDifferenceInDays(this.leaveFormData.startdate, this.leaveFormData.enddate, this.selectedleave.category.excludeWeekends);
      // Add the difference to the existing booked days
      const totalBookedDays = this.selectedleave.booked + differenceInDays;
      // Check if the total booked days exceed the allowed limit
      if (totalBookedDays <= this.selectedleave.allowedDays) {
        this.subscription = this.http.postdata("Timeoff", this.leaveFormData).subscribe({
          next: (data: any) => {
            console.log(data);
            localStorage.setItem('onbehalfof', JSON.stringify(data));
            if (data) {
              this.generateEmail(data)
              this.leaveBalance(data);
              this.leaveForm.reset();
              this.resetRadioButtons();
              this.conformationPopup.openSuccessModal('Leave processed successfully')
              setTimeout(() => {
                this.modalService.dismissAll();
                this.leaveForm.reset();
                window.location.reload();
              }, 2000);
              this.startdatevalid = true
              this.disableSubmitButton = true
              this.issEndDategreater = true
              this.isDayTypeselected = false
              this.isstimeoffValid = true
              this.startdatevalid = true
              this.isHolidaySelected = false
              this.isWeekOffSelected = false
              this.isWeekOffSelectedEndate = false
              this.enableButton = false
              this.dateDiff = 0;
            }
          },
          error: (err: any) => {
            this.conformationPopup.openErrorModal(err.error.message)
          },
          complete: () => {
            this.leaveForm.reset();
          }
        });
      } else {
        // Display modal message and set status
        console.warn('Maximum leave limit reached for this category.');
        this.conformationPopup.openErrorModal('Maximum leave limit reached for this category')
      }
    }
  }

  leaveBalance(Values: any) {
    let data = {
      empId: Values.employeeId,
      isdeleted: "Active",
      leavesTaken: this.leaveFormData.duration,
      categoryId: this.leaveFormData.categoryId
    }
    this.leaveFormData.employeeId = this.leaveapplication.employeeId
    this.subscription = this.http.postdata(`LeaveBalance`, data).subscribe({
      next: (data: any) => {
        this.getCategoryDetails(data.empId);
      }

    })
  }

  monthsArray: { month: string, startDate: Date, endDate: Date }[] = [];
  getMonthsArray(startDate: Date, endDate: Date) {
    // Convert input dates to Date objects if they are not already
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    const months = [];
    // Set the initial start date to the 11th of the start month
    let currentStart = new Date(startDate);
    // Calculate the first end date as the day before the same day next month
    let currentEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, currentStart.getDate() - 1);
    // Adjust if the initial end date exceeds the given endDate
    if (currentEnd > endDate) {
      currentEnd = endDate;
    }
    let id = 1;
    // Loop through each month until the end date is reached
    while (currentStart <= endDate) {
      const monthYear = `${currentStart.toLocaleString('default', { month: 'long' })} ${currentStart.getFullYear()}`;
      months.push({ id: id, month: monthYear, startDate: new Date(currentStart), endDate: new Date(currentEnd) });
      id++;
      // Move to the next month
      currentStart.setMonth(currentStart.getMonth() + 1);
      currentStart.setDate(startDate.getDate());  // Reset the date to the 11th of the next month
      // Calculate the end date as the day before the same day next month
      currentEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, currentStart.getDate() - 1);
      // Adjust if the current end date exceeds the given endDate
      if (currentEnd > endDate) {
        currentEnd = endDate;
      }
    }
    return months;
  }

  resetRadioButtons() {
    this.isDayTypeselected = false
    if (this.halfDayRadio) {
      this.halfDayRadio.nativeElement.checked = false;
    }
    if (this.fullDayRadio) {
      this.fullDayRadio.nativeElement.checked = false;
    }
  }

  isWithinExistingRanges(startDate: any, endDate: any, leavebal: any, applyingleavescount: any) {
    let response = false;
    let data = this.lpdata.filter(record => record.status !== 'Rejected' &&  // Exclude rejected leaves in range checking
      (
        (new Date(record.startdate) >= new Date(startDate) && new Date(record.startdate) <= new Date(endDate)) ||
        (new Date(record.enddate) >= new Date(startDate) && new Date(record.enddate) <= new Date(endDate)) ||
        (new Date(startDate) >= new Date(record.startdate) && new Date(startDate) <= new Date(record.enddate)) ||
        (new Date(endDate) >= new Date(record.startdate) && new Date(endDate) <= new Date(record.enddate))
      )
    );
    const totalLeavesTaken = data.reduce((acc, current) => acc + current.duration, 0);
    if ((totalLeavesTaken + applyingleavescount) > leavebal) {
      response = true;
    }
    return response;
  }

  calculateDateDifference(startDate: string, endDate: string) {
    var date1 = moment(startDate, 'YYYY-MM-DD');
    var date2 = moment(endDate, 'YYYY-MM-DD');
    var days = date2.diff(date1, 'days');
    const start = moment(startDate);
    const end = moment(endDate);
    let diff = days + 1;
    let currentDate = start;
    while (currentDate <= end) {
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
        if (this.orgholidays?.orgHolidaysItems?.some((holiday: any) => moment(holiday.holidayDate).isSame(startDate, 'day') && (holiday.isOptional === false || holiday.isOptional === null))) {
          this.isNonOptionalHolidaySelected = true;
        } else {
          this.isNonOptionalHolidaySelected = false;
        }
        let nonOptionalHolidays = this.orgholidays?.orgHolidaysItems.filter((ele: any) => ele.isOptional === false || ele.isOptional == null);
        if (nonOptionalHolidays?.some((holiday: any) => moment(holiday.holidayDate).isSame(endDate, 'day'))) {
          this.isHolidaySelectedEndate = true;
        } else {
          this.isHolidaySelectedEndate = false;
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
    }
    if (endDate != null) {
      this.dateDifference = diff;
      if (this.dateDifference > 1) {
        this.chooseDayType('full')
      }
      else if (this.dateDifference <= 1) {
        this.isDayTypeselected = false;
        this.selectedValuehalf = '';
        this.enableButton = false;
      }
      this.dateDiff = this.leaveFormData.isDaytype ? this.dateDifference / 2 : this.dateDifference;
    }
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
      
      if(this.leaveForm.get('availing')?.value === 'firsthalf'){
        this.selectedValue = '1'
        this.leaveForm.patchValue({ 
          halfdayavailing: '1',   // Half day selected
          fulldayavailing: null   // Clear full day selection
        });
      }
      if(this.leaveForm.get('availing')?.value === 'secondhalf'){
        this.selectedValue = '3'
        this.leaveForm.patchValue({ 
          halfdayavailing: '1',   // Half day selected
          fulldayavailing: null   // Clear full day selection
        });
      }
    }
    else if (daytype === 'full') {
      this.disableSubmitButton = false;
      this.leaveFormData.isDaytype = false;
      this.enableButton = false;
      if(this.enableHalfDayOptions === false){
        this.leaveForm.get('halfdayavailing')?.disable();
        this.leaveForm.get('availing')?.disable();
      }
      this.toggleFullDayOptions(false);
      if(this.dateDifference > 1){
        this.leaveForm.get('halfdayavailing')?.disable();
        this.leaveForm.get('availing')?.disable();
        this.leaveForm.patchValue({ fulldayavailing: '2' });
        this.leaveForm.patchValue({ halfdayavailing: null, availing: null });
      }
      this.selectedValue = '2'
    }
  }

  generateEmail(Value: any) {
    let emaildetails = {
      employeeId: this.leaveapplication.employeeId,
      enddate: Value.enddate,
      startdate: Value.startdate,
      currentApprover: this.empdata.employeeId,
      appliedDate: this.leaveFormData.date
    }
    //Third Step is to send the email and attachment to Directreportee
    this.subscription = this.http.postdata(`CustomEmail/LeaveConfirmationToEmp`, emaildetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Email Sent Successfully')
      },
    })
  }

  calculateDifferenceInDays(startDate: Date, endDate: Date, excludeWeekends: boolean): number {
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    let differenceInDays = endMoment.diff(startMoment, 'days') + 1;
    if (excludeWeekends) {
      const startDay = startMoment.day();
      const endDay = endMoment.day();
      const weekends = Math.floor((differenceInDays + startDay) / 7);
      differenceInDays -= weekends * 2;
      if (startDay === 0 && endDay === 6) differenceInDays--;
    }
    return differenceInDays;
  }

  cleardata() {
    this.leaveForm.reset();
    this.modalService.dismissAll();
  }

  onstartdate(action: string) {
    this.disableSubmitButton = false;
    this.leaveForm.patchValue({ halfdayavailing: null });
    this.leaveForm.patchValue({ availing: null });
    this.leaveForm.patchValue({ fulldayavailing: null });
    if(this.leaveForm.get('availing')?.value === null || this.leaveForm.get('fulldayavailing')?.value === null){
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
  }

  updateStartDateValidity1(): void {
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    if (!this.startDate || !this.endDate || this.startDate <= this.endDate) {
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
    const dayPresent = this.orgweekend.orgWeekendItems?.some((holiday: any) => {
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

  onEndDate(action: string) {
    this.onEndDateChange();
    this.updateEndDateValidity();
    this.updateStartDateValidity1();
    this.checkWeekendsEndate(action);
    this.dateCheckWithHolidayOrWeekend(action);
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
      // selectedDate = moment(this.selectedfields.startdate);
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

  onStartDateChange() {
    // Set the min and max for the end date based on the selected start date
    this.startDate = moment(this.leaveForm.get('startdate')?.value).format('YYYY-MM-DD');
    this.endDate = moment(this.leaveForm.get('enddate')?.value).format('YYYY-MM-DD');
    this.minEndDate = this.startDate;
    this.maxEndDate = `${new Date(this.startDate).getFullYear() + 1}-12-31`;
    if (!this.startDate) {
      // Clear the end date if start date is cleared
      this.endDate = null;
      // Reset end date related errors
      this.isWeekOffSelectedEndate = false;
      this.isHolidaySelectedEndate = false;
      this.issEndDategreater = true;
    }
  }
  
  
}