import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WfhApprovaltabsComponent } from "../../shared/wfh-approvaltabs/wfh-approvaltabs.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IJob } from '../../Interfaces/letters-model';
import { Ileavesdatas, Ilpid, IValidations } from '../../Interfaces/timoff-model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import moment from 'moment';
import { Subject } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-work-from-home',
  imports: [CommonModule, RouterModule, WfhApprovaltabsComponent,ReactiveFormsModule],
  templateUrl: './work-from-home.component.html',
  styleUrl: './work-from-home.component.scss',
})
export class WorkFromHomeComponent implements OnInit, OnDestroy {
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
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intializeCompOffForm();
    this.halfDayValue = JSON.parse(
      localStorage.getItem('filterHalfDayData') || '{}'
    );
    this.fullDayValue = JSON.parse(
      localStorage.getItem('filterFullDayData') || '{}'
    );

    this.getDataByLPID();
    this.getWorkfromhomeCriteria();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  intializeCompOffForm() {
    this.addWFHForm = this.fb.group({
      workedDate: ['', Validators.required],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', Validators.required],
    });
  }



  updateDuration() {
    // this.enableButton = false;
    // this.selectedValuehalf=false;
    // let starttime =`${this.compoffdata.startTimeProp} ${this.compoffdata.am}`
    // console.log(starttime);
    // let endtime =`${this.compoffdata.endTimeProp} ${this.compoffdata.pm}`
    // console.log(endtime);
    console.log(this.workFromHomedata.startTimeProp);
    console.log(this.workFromHomedata.endTimeProp);
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
      console.log(this.workFromHomedata.startTimeProp);
      console.log(this.workFromHomedata.endTimeProp);
      console.log(this.hours, this.minutes);
      console.log(durationAsFloat);
      console.log(this.workFromHomedata.duration);
      const orgHalfDayWFHCritera = parseFloat(this.halfDayValue.value);
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

  getDataByLPID() {
    let emp = this.empinfo.employeeId;
    this.http.getData(`Timeoff/LPID/${emp}`).subscribe({
      next: (response: any) => {
        console.log(response);

        this.lpdata = response;
        console.log(this.lpdata); // the response data stored in the lpdata varable//
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getWorkfromhomeCriteria() {
    this.http.getData(`WorkFromHomeEligibilityCriteria`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.Workfromhome = response;
        const filterminhoursData = this.Workfromhome.find(
          (item: any) => item.name === 'maxDuration'
        );
        this.hoursLimit = filterminhoursData;
        const filterHalfDayData = this.Workfromhome.find(
          (item: any) => item.name === 'minHalfDayHours'
        );
        console.log(filterHalfDayData);
        localStorage.setItem(
          'filterHalfDayData',
          JSON.stringify(filterHalfDayData)
        );
        const filterFullDayData = this.Workfromhome.find(
          (item: any) => item.name === 'minFullDayHours'
        );
        console.log(filterFullDayData);
        localStorage.setItem(
          'filterFullDayData',
          JSON.stringify(filterFullDayData)
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
    console.log(addForm);

    if (addForm.valid) {
      const formData = addForm.value;
      const payload = {
        empId: this.empinfo.employeeId,
        startTime: formData.workedDate,
        endTime: formData.workedDate,
        requestedComments: this.workFromHomedata.requestedComments,
        durationType: +formData.availing,
        duration:+formData.availing == 2 ? 1 : 0.5,
        status: 'Waiting for Approval',
        reason: formData.reason,
        requestedCategory: 2,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      console.log(payload);

      this.http.postdata('AttendanceRequests', payload).subscribe({
        next: (res: any) => {
          // this.getCompOffRequest();
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal(
            'Request submitted successfully'
          );
          this.http.tirggerCountSignal.update((status) => ({
            ...status,
            wfh: true,
          }));

          //write a signal to trigger the get all count in the side bar
        },
        error: (err: any) => {},
        complete: () => {},
      });
    }

  
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
