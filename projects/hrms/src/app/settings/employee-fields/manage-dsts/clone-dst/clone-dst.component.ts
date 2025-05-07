import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ILocation,
  IShiftHeader,
  ISubLocation,
} from '../../../time-off/flexible-leave-allocation/leave-allocation.model';
import { IJob } from '../../../../Interfaces/letters-model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { ManageDST } from '../dsts.modal';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';

@Component({
  selector: 'app-clone-dst',
  imports: [SelectModule, CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './clone-dst.component.html',
  styleUrl: './clone-dst.component.scss',
})
export class CloneDstComponent implements OnInit, OnDestroy {
  dstForm!: FormGroup;
  yearsList: number[] = [];
  empinfo = {} as IJob;
  destroy$ = new Subject<void>();
  locationDetails: ILocation[] = [];
  subLocationDetails: ISubLocation[] = [];
  shiftDetails: IShiftHeader[] = [];
  momentType: string[] = ['Forward', 'Backward'];
  durations: number[] = [1, 1.5, 2, 2.5, 3];
  clonedDST: ManageDST | null = null;
  hidePublishCloneButtons: boolean = false;
  minHolidayDate: string = '';
  maxHolidayDate: string = '';
  updateHolidaysData: any;
  blockedDates: any = [];
  @ViewChild('confirmation') confirmation!: TemplateRef<any>;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
     this.yearsList = this.getYears();
  this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
  this.updateHolidaysData = JSON.parse(localStorage.getItem('cloneDST') ?? '{}');
  this.inititializeForm();

  const localStorageData = localStorage.getItem('cloneDST');
  if (localStorageData) {
    this.clonedDST = JSON.parse(localStorageData);
  }

  if (this.clonedDST) {
    this.dstForm.patchValue({
      year: this.clonedDST.applicableYear,
    });
  }

  this.getAllLocations();
  const selectedYear = this.updateHolidaysData.applicableYear || new Date().getFullYear();
  this.setDateLimits(selectedYear);

    // year changes method is triggering
    this.dstForm.get('year')?.valueChanges.subscribe((yearVal: any) => {
      const year = +yearVal;
      if (year) {
        this.setDateLimits(year);
    this.momentRows.controls.forEach((group: AbstractControl) => {
      ['startDate', 'endDate'].forEach(field => {
        const currentVal = group.get(field)?.value;
        if (currentVal) {
          const oldDate = new Date(currentVal);
          const newDate = new Date( year, oldDate.getMonth(), oldDate.getDate());
          const formattedDate = this.formatDate(newDate);

          if (formattedDate >= this.minHolidayDate && formattedDate <= this.maxHolidayDate) {
            group.get(field)?.setValue(formattedDate, { emitEvent: false });
          } else {
            group.get(field)?.setValue('', { emitEvent: false }); // Clear if out of range
          }
        }
      
      });
    });
      

  }
}); 
    

  }
// this method used for year change selected yr month show in manage holiday date
formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

setDateLimits(year: number): void {
  this.minHolidayDate = `${year}-01-01`;
  this.maxHolidayDate = `${year}-12-31`;

  this.momentRows.controls.forEach(control => {
    ['startDate', 'endDate'].forEach(field => {
      const dateControl = control.get(field);
      if (dateControl) {
        dateControl.setValidators([
          Validators.required,
          this.yearRangeValidator(this.minHolidayDate, this.maxHolidayDate)
        ]);
        dateControl.updateValueAndValidity();
      }
    });
  });
}

yearRangeValidator(min: string, max: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;
    return value >= min && value <= max ? null : { outOfRange: true };
  };
}

inititializeForm() {
  this.dstForm = this.fb.group({
    year: ['', Validators.required],
    location: ['', Validators.required],
    subLocation: [{ value: '', disabled: true }, Validators.required],
    shift: [{ value: null, disabled: true }, Validators.required],
    momentRows: this.fb.array([]),
  });

  if (!this.clonedDST?.dayLight?.length) {
    this.addMomentRow(); // Add first row if form is fresh
  }
}

createMomentRow(): FormGroup {
  return this.fb.group({
    startDate: ['', [Validators.required, this.yearRangeValidator(this.minHolidayDate, this.maxHolidayDate)]],
    endDate: ['', [Validators.required, this.yearRangeValidator(this.minHolidayDate, this.maxHolidayDate)]],
    momentType: [null, Validators.required],
    duration: [null, Validators.required],
  });
}

  
  get momentRows(): FormArray {
    return this.dstForm.get('momentRows') as FormArray;
  }

  addMomentRow() {
    if (this.momentRows.length < 4) {
      this.momentRows.push(this.createMomentRow());
    }
  }

  //this method used for delete icon click
  removeMomentRow(index: number): void {
    if (this.momentRows.length > 1) {
      this.momentRows.removeAt(index);
    }
  }


  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);
  }
  isBlocked(date: any) {
    for (let range of this.blockedDates) {
      if (date >= range.startDate && date <= range.endDate) {
        return true;
      }
    }
    return false;
  }
  onStartDateChange(event: any, row: any) {
    this.minHolidayDate = event;
    if (this.isBlocked(event)) {
     
      row.startDate = '';
      this.sharedModalService.openErrorModal('The selected start date is within a range that has already been selected. Please choose a different date.');
    } else {
      if (row.endDate) {
        this.blockedDates.push({ startDate: row.startDate, endDate: row.endDate });
      } else {
        this.blockedDates.push({ startDate: row.startDate, endDate: row.startDate });
      }
    }
  }
  onEndDateChange(event: any, row: any) {
    if (this.isBlocked(event)) {
      row.endDate = '';
      this.sharedModalService.openErrorModal('The selected end date is within a range that has already been selected. Please choose a different date.');
    } else {
      if (row.startDate) {
        this.blockedDates.push({ startDate: row.startDate, endDate: row.endDate });
      } else {
        this.blockedDates.push({ startDate: row.endDate, endDate: row.endDate });
      }
    }
  }
  onLocationChange(location: ILocation): void {
    this.subLocationDetails = location.jobSubLocations ?? [];
    this.dstForm.get('subLocation')?.enable();
    this.dstForm.get('subLocation')?.reset();
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id,
    };
   
    this.http
      .getDataWithQueryParams('orgShifts/getshiftlocation', params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap(
            (header: any) => header.orgShiftsItems || []
          );
          this.dstForm.get('shift')?.enable();
        },
        error: (err) => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.dstForm.get('shift')?.reset();
          this.dstForm.get('shift')?.disable();
        },
      });
  }

  private getAllLocations(): void {
    this.http
      .getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.locationDetails = res.jobLocations || [];
          const selectedLocation = this.locationDetails.find(
            (loc) => loc.id === this.clonedDST?.locationId
          );
          this.subLocationDetails = selectedLocation?.jobSubLocations ?? [];

          const selectedSubLocation = this.subLocationDetails.find(
            (sub) => sub.id === this.clonedDST?.sublocationId
          );

          // this.dstForm.patchValue({
          //   location: selectedLocation ?? null,
          //   subLocation: selectedSubLocation ?? null,
          // });

          // if (selectedSubLocation) {
          //   this.getAllShifts(selectedSubLocation);
          // }

          // Patch moment rows
          if (this.clonedDST?.dayLight?.length) {
            this.momentRows.clear();
            this.clonedDST.dayLight.forEach((row) => {
              this.momentRows.push(
                this.fb.group({
                  startDate: this.formatToDateInput(row.startDate),
                  endDate: this.formatToDateInput(row.endDate),
                  momentType: row.momentType,
                  duration: row.duration,
                })
              );
            });
          }

          console.log('Form Data', this.dstForm.value);
        },
        error: (err) => console.error('Error fetching locations:', err),
      });
  }

  formatToDateInput(dateStr: string): string {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onSubmit(dstForm: FormGroup) {
    if (dstForm.invalid) {
      this.dstForm.markAllAsTouched();
      return;
    }

    const formValue = this.dstForm.value;

    const manageDST = {
      lastModifiedDate: new Date(),
      addedDate: new Date(),
      status: 'Pending for submission',
      addedBy: this.empinfo.employeeId,
      lastModifiedBy: this.empinfo.employeeId,
      applicableYear: formValue.year,
      sublocationId: formValue.subLocation.id,
      shiftId: formValue.shift.id,
      locationId: formValue.location.id,
      dayLight: formValue.momentRows.map((row: any) => ({
        startDate: row.startDate,
        endDate: row.endDate,
        momentType: row.momentType,
        duration: row.duration,
      })),
    };

    console.log('Payload:', manageDST);

    this.http
      .postdata('OrgDayLight/Post/Shift/OrgShift', manageDST)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.sharedModalService.openSuccessModal(
            'DST added Successfully'
          );
          this.navigate();
        },
        error: (err) => {
          this.sharedModalService.openErrorModal(
            'DST already exists with the year , location and sub location'
          );
        },
        complete: () => {},
      });
  }

  UpdateDST(dstForm: FormGroup) {
    if (dstForm.valid) {
      const formValue = dstForm.value;

      const holidays = {
        lastModifiedDate: new Date(),
        addedDate: new Date(),
        id: this.clonedDST?.id,
        status: 'Pending for submission',
        addedBy: this.empinfo.employeeId,
        lastModifiedBy: this.empinfo.employeeId,
        applicableYear: this.clonedDST?.applicableYear,
        sublocationId: this.clonedDST?.sublocationId,
        shiftId: this.clonedDST?.shiftId,
        locationId: this.clonedDST?.locationId,
        dayLight: formValue.momentRows.map((row: any) => ({
          startDate: new Date(row.startDate),
          endDate: new Date(row.endDate),
          momentType: row.momentType,
          duration: row.duration,
          headerId: this.clonedDST?.dayLight?.[0]?.headerId,
        })),
      };

      console.log('holidays payload:', holidays);

      this.http
        .postdata('OrgDayLight/Update/Shift/OrgShift', holidays)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log(response);
            if (response.statusCode === 400) {
              this.sharedModalService.openErrorModal(
                'Error: Shift already exists.'
              );
            }

            this.sharedModalService.openSuccessModal(
              'DST added successfully'
            );
            this.navigate();
          },
          error: (err) => {
            if (err.error) {
              this.sharedModalService.openErrorModal(
                'Error: ' + err.error.Message
              );
            }
          },
        });
    }
  }

  closeCloneDST(){
    this.modalService.dismissAll();
    this.navigate();
   }
   openConfirmation(){
    this.modalService.open(this.confirmation, {centered: true, backdrop: 'static'})
  }

  publishDST() {
    let publishItem = {
      Category: 'Daylightsaving',
      refentityId: this.clonedDST?.dayLight[0].headerId,
    };
    this.http
      .postdata(
        `CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`,
        { params: publishItem }
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respnose: any) => {
          this.sharedModalService.openSuccessModal(
            'Manage DST Published Successfully'
          );
          this.navigate();
        },
        error: (err) => {
          if (err.error) {
            this.sharedModalService.openErrorModal(err.error);
          }
          this.sharedModalService.openErrorModal(
            'Error occured while publishing manage dst'
          );
        },
      });
  }
  navigate(): void {
    this.router.navigate(['/settings/employee-fields/manage-dsts']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
