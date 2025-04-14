import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompOffApprovalTabsComponent } from '../../shared/comp-off-approval-tabs/comp-off-approval-tabs.component';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IJob } from '../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { LeaveConfigurationSetting, OrgHolidayHeader, OrgWeekendHeader } from '../../Interfaces/compoff.modal';
import { CommonModule } from '@angular/common';
import { Ileavesdatas, IValidations } from '../../Interfaces/timoff-model';
import moment from 'moment';
import { OpenModalService } from '../../services/open-modal.service';


@Component({
  selector: 'app-comp-off',
  imports: [
    CompOffApprovalTabsComponent,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
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


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService:OpenModalService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo);
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
    this.handleAvailingChange()
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  intializeCompOffForm() {
    this.addCompOffForm = this.fb.group({
      workedDate: ['', 
        [Validators.required, this.onlyWeekendsValidator.bind(this), this.afterJoiningDateValidator.bind(this)]
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

  applyCompOff(addForm: FormGroup) {
    console.log(addForm);

    if (addForm.valid) {
      const formData = addForm.value;
      const payload = {
        empId: this.empinfo.employeeId,
        startTime: formData.workedDate,
        endTime: formData.workedDate,
        requestedComments: this.compoffdata.requestedComments,
        durationType: +formData.availing,
        duration:+formData.availing == 2 ? 1 : 0.5,
        status: 'Waiting for Approval',
        reason: formData.reason,
        requestedCategory: 3,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      console.log(payload);
      this.spinnerLoader = true;
      this.http.postdata('AttendanceRequests', payload).subscribe({
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

          setTimeout(() => {
            window.location.reload();
          }
        , 2000);
          //write a signal to trigger the get all count in the side bar
        },
        error: (err: any) => {
          this.spinnerLoader = false;
        },
        complete: () => {
          this.addCompOffForm.reset();
          this.spinnerLoader = false;},
      });
    }

    throw new Error('Method not implemented.');
  }

  updateDuration() {
    // this.enableButton = false;
    // this.selectedValuehalf=false;
    // let starttime =`${this.compoffdata.startTimeProp} ${this.compoffdata.am}`
    // console.log(starttime);
    // let endtime =`${this.compoffdata.endTimeProp} ${this.compoffdata.pm}`
    // console.log(endtime);
    console.log(this.compoffdata.startTimeProp);
    console.log(this.compoffdata.endTimeProp);
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
      // if(this.compoffdata.duration >= 9){
      //   this.timeValudationError=false;
      // }
      console.log(this.compoffdata.startTimeProp);
      console.log(this.compoffdata.endTimeProp);
      console.log(this.hours, this.minutes);
      console.log(durationAsFloat);
      console.log(this.compoffdata.duration);
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

  getWorkfromhomeCriteria() {
    this.http
      .getData(`CompOffEligibilityCriteria`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOffEligibilityCriteria = response;
          const filterHalfDayData = this.compOffEligibilityCriteria.find(
            (item: any) => item.name === 'minHalfDayHours'
          );
          const filterminhoursData = this.compOffEligibilityCriteria.find(
            (item: any) => item.name === 'maxDuration'
          );
          this.filteredMinhoursData =
            filterminhoursData ?? ({} as LeaveConfigurationSetting);
          console.log(filterHalfDayData);

          localStorage.setItem(
            'filterHalfDayData',
            JSON.stringify(filterHalfDayData)
          );
          const filterFullDayData = this.compOffEligibilityCriteria.find(
            (item: any) => item.name === 'minFullDayHours'
          );
          console.log(filterFullDayData);
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
  // Custom Validator: Allow only weekends
  onlyWeekendsValidator(control: AbstractControl): { [key: string]: boolean } | null {
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
