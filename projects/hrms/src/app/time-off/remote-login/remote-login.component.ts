import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../Interfaces/letters-model';
import { Ileavesdatas, Ilpid, IValidations } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-remote-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './remote-login.component.html',
  styleUrl: './remote-login.component.scss'
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
  availablebalance!:number
  totalbalance: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intializewfhForm();
    this.halfDayValue = JSON.parse(
      localStorage.getItem('filterHalfDayData') || '{}'
    );
    this.fullDayValue = JSON.parse(
      localStorage.getItem('filterFullDayData') || '{}'
    );
    this.handleAvailingChange()
  }


  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  intializewfhForm() {
    this.addremoteForm = this.fb.group({
      workedDate: ['', 
        [Validators.required, ]
      ],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', Validators.required],
    });
  }

  handleAvailingChange(){
    this.addremoteForm.get('availing')?.valueChanges.subscribe(value => {
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
    console.log(this.remotedata.startTimeProp);
    console.log(this.remotedata.endTimeProp);
    if (
      this.remotedata.startTimeProp &&
      this.remotedata.endTimeProp
    ) {
      const formattedStartTime = moment(
        this.remotedata.startTimeProp
      ).format('HH:mm');
      const formattedEndTime = moment(this.remotedata.endTimeProp).format(
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
      this.remotedata.duration = durationAsFloat.toFixed(2);
      // if(this.remotedata.duration >= 9){
      //   this.timeValudationError=false;
      // }
      console.log(this.remotedata.startTimeProp);
      console.log(this.remotedata.endTimeProp);
      console.log(this.hours, this.minutes);
      console.log(durationAsFloat);
      console.log(this.remotedata.duration);
      const orgHalfDayWFHCritera = parseFloat(this.halfDayValue.value);
      if (this.remotedata.duration < orgHalfDayWFHCritera) {
        this.remotedata.duration = null;
        this.wfhValidations.DurationErrorMessage =
          'Provided duration is not eligible for Comp Off';
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
    const formattedStartTime = moment(
      this.remotedata.startTimeProp
    ).format('HH:mm');
    const formattedEndTime = moment(this.remotedata.endTimeProp).format(
      'HH:mm'
    );
    // Split start and end time strings into hours and minutes
    const [startHours, startMinutes] = formattedStartTime
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = formattedEndTime.split(':').map(Number);
    let startDate = moment(this.remotedata.startTimeProp).format(
      'YYYY-MM-DD'
    );
    let endDate = moment(this.remotedata.endTimeProp).format(
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

  applyremote(addForm: FormGroup) {
    console.log(addForm);

    if (addForm.valid) {
      const formData = addForm.value;

      const isFullDay = +formData.availing === 2;
  
      const payload = {
        empId: this.empinfo.employeeId,
        startTime: formData.workedDate,
        endTime: formData.workedDate,
        requestedComments: this.remotedata.requestedComments,
        durationType: isFullDay ? 2 : +formData.halfType, // 1: First Half, 3: Second Half, 2: Full Day
        duration: isFullDay ? 1 : 0.5,
        status: 'Waiting for Approval',
        reason: formData.reason,
        requestedCategory: 11,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      console.log(payload);
      
      this.spinnerLoader = true;
      this.http.postdata('AttendanceRequests', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          // this.getCompOffRequest();
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal(
            'Request submitted successfully'
          );
         

          setTimeout(() => {
            this.addremoteForm.reset();
          }
        , 2000);
          this.http.tirggerCountSignal.update((status) => ({
            ...status,
            remote: true,
          }));
          //write a signal to trigger the get all count in the side bar
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.sharedModalService.openErrorModal(err.error.message)
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
