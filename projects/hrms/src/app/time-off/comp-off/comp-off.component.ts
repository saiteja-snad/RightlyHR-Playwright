import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IJob } from '../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { LeaveConfigurationSetting, OrgHolidayHeader, OrgWeekendHeader } from '../../Interfaces/compoff.modal';
import { CommonModule } from '@angular/common';
import { Ileavesdatas, IValidations } from '../../Interfaces/timoff-model';
import moment from 'moment';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { CompOffApprovalTabsComponent } from "../../shared/time-off-module-tabs/comp-off-approval-tabs/comp-off-approval-tabs.component";
import { FormValidationsService } from '../../services/form-validations.service';
@Component({
  selector: 'app-comp-off',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    CompOffApprovalTabsComponent,
  ],
  templateUrl: './comp-off.component.html',
  styleUrl: './comp-off.component.scss',
})
export class CompOffComponent implements OnInit, OnDestroy {
  addCompOffForm!: FormGroup;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  holidaysData!: OrgHolidayHeader;
  weekendsData!: OrgWeekendHeader;
  compOffEligibilityCriteria: LeaveConfigurationSetting[] = [];
  filteredMinhoursData!: LeaveConfigurationSetting;
  compoffdata = {} as Ileavesdatas;
  halfDayValue = {} as any;
  fullDayValue = {} as any;
  minutes!: any;
  hours!: any;
  duration!: any;
  wfhValidations = {} as IValidations;
  spinnerLoader = false;
  alloweddates: string = '';
  isWeekOffSelected = true;
  isHolidaySelected = true;
  selectedDay = '';
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
    this.halfDayValue = JSON.parse(
      localStorage.getItem('filterHalfDayData') || '{}'
    );
    this.fullDayValue = JSON.parse(
      localStorage.getItem('filterFullDayData') || '{}'
    );
    this.intializeCompOffForm();
    this.getWorkfromhomeCriteria();
    this.getEmployeeeHolidays();
    this.getEmployeeeWeekends();
    this.handleAvailingChange();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  intializeCompOffForm() {
    this.addCompOffForm = this.fb.group({
      workedDate: [
        '',
        [Validators.required, this.afterJoiningDateValidator.bind(this)],
      ],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', Validators.required],
    });
  }

  handleAvailingChange() {
    this.addCompOffForm.get('availing')?.valueChanges.subscribe((value) => {
      const halfTypeControl = this.addCompOffForm.get('halfType');
      if (value === 'Half Day') {
        halfTypeControl?.setValidators(Validators.required);
      } else {
        halfTypeControl?.clearValidators();
        halfTypeControl?.setValue(null);
      }
      halfTypeControl?.updateValueAndValidity();
    });
  }

  weekendAndHolidaysCheck(selectedDate:string){
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
    
    const isDatePresent = this.holidaysData?.orgHolidaysItems?.some((holiday: any) => holiday.holidayDate === selectedDate);
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
  
    console.log(captureHoliday);
    if (captureHoliday && dayPresent) {
      if (weekNumber === 1 && dayPresent) {
        if (captureHoliday.firstweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
        console.log("First week of the month");
      } else if (weekNumber === 2 && dayPresent) {
        if (captureHoliday.secondweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
        console.log("Second week of the month");
      } else if (weekNumber === 3) {
        if (captureHoliday.thirdweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
        console.log("Third week of the month");
      } else if (weekNumber === 4) {
        if (captureHoliday.fourthweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
        console.log("Fourth week of the month");
      } else if (weekNumber === 5) {
        if (captureHoliday.fifthweek) {
          this.isWeekOffSelected = true;
        } else {
          this.isWeekOffSelected = false;
        }
        console.log("Fifth week of the month");
      }
    }
    console.log(this.isWeekOffSelected);
  }

  applyCompOff(addForm: FormGroup) {
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
        reason: formData.reason,
        requestedCategory: 3,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      this.spinnerLoader = true;
      this.http
        .postdata('AttendanceRequests', payload)
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
              compOff: true,
            }));
            this.http.compOffTriggerSignal.set(true);
            this.addCompOffForm.reset();
            //write a signal to trigger the get all count in the side bar
          },
          error: (err: any) => {
            this.spinnerLoader = false;
            if (
              err.error.message.toLowerCase() ==
              'you already applied to same category for same day'
            ) {
              this.sharedModalService.openErrorModal(
                'Same date range already exists'
              );
            } else {
              this.sharedModalService.openErrorModal(err.error.message);
            }
          },
          complete: () => {
            
            this.spinnerLoader = false;
          },
        });
    }
  }

  updateDuration() {
    if (this.compoffdata.startTimeProp && this.compoffdata.endTimeProp) {
      const formattedStartTime = moment(this.compoffdata.startTimeProp).format(
        'HH:mm'
      );
      const formattedEndTime = moment(this.compoffdata.endTimeProp).format(
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
      this.compoffdata.duration = durationAsFloat.toFixed(2);
      const orgHalfDayWFHCritera = parseFloat(this.halfDayValue.value);
      if (this.compoffdata.duration < orgHalfDayWFHCritera) {
        this.compoffdata.duration = null;
        this.wfhValidations.DurationErrorMessage =
          'Provided duration is not eligible for Comp Off';
        this.wfhValidations.isdurationValidated = true;
      } else {
        this.duration = this.compoffdata.duration;
      }
      if (endTime < startTime) {
        // If Out Time is greater than In Time, set Out Time equal to In Time
        this.compoffdata.endTimeProp = this.compoffdata.startTimeProp;
      }
    }
  }

  getEmployeeeHolidays() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(`orgHolidays/getOrgHoliday/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.holidaysData = data;
        },
      });
  }

  getWorkfromhomeCriteria() {
    this.http
      .getData(`CompOffEligibilityCriteria`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.compOffEligibilityCriteria = response;
          const filterHalfDayData = this.compOffEligibilityCriteria.find(
            (item: any) => item.name === 'minHalfDayHours'
          );
          const filterminhoursData = this.compOffEligibilityCriteria.find(
            (item: any) => item.name === 'maxDuration'
          );
          this.filteredMinhoursData =
            filterminhoursData ?? ({} as LeaveConfigurationSetting);
          localStorage.setItem(
            'filterHalfDayData',
            JSON.stringify(filterHalfDayData)
          );
          const filterFullDayData = this.compOffEligibilityCriteria.find(
            (item: any) => item.name === 'minFullDayHours'
          );
          localStorage.setItem(
            'filterFullDayData',
            JSON.stringify(filterFullDayData)
          );
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.compOffEligibilityCriteria = []; // Set to empty array on error
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
        },
      });
  }

  // Custom Validator: Allow only weekends
  onlyWeekendsValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    if (control.value) {
      const date = new Date(control.value);
      const day = date.getDay();
      // Check if the day is not Saturday (6) or Sunday (0)
      if (day !== 0 && day !== 6) {
        return { notWeekend: true };
      }
    }
    return null;
  }

  // Custom Validator: Ensure date is after the date of joining
  afterJoiningDateValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
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
  }
}