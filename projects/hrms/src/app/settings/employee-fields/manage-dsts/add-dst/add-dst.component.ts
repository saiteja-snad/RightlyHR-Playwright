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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-dst',
  imports: [SelectModule, CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './add-dst.component.html',
  styleUrl: './add-dst.component.scss',
})
export class AddDstComponent implements OnInit, OnDestroy {
  dstForm!: FormGroup;
  yearsList: number[] = [];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  locationDetails!: ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  momentType: string[] = ['Forward', 'Backward'];
  durations: number[] = [1, 1.5, 2, 2.5, 3];
  blockedDates: any = [];
  minDate!: string;
  maxDate!: string;
  currentYear: number = new Date().getFullYear();
  selectedYear = this.currentYear;
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
    // this.minDate = `${this.selectedYear}-01-01`;
    // this.maxDate = `${this.selectedYear}-12-31`;
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.inititializeForm();
    this.getAllLocations();
    this.handleFormValueChanges();
     // year onchange method 
     this.dstForm.get('year')?.valueChanges.subscribe((selectedYear: any) => {
      if (selectedYear) {
        this.setDateLimitsForYear(selectedYear);
      }
    });
    // Set initial date limits
    this.setDateLimitsForYear(this.currentYear);
  }

  //this method used for selected year show when user change yr in dropdown
  setDateLimitsForYear(year: number): void {
    this.minDate = `${year}-01-01`;
    this.maxDate = `${year}-12-31`;

    this.momentRows.controls.forEach(control => {
      const startDateControl  = control.get('startDate');
      const endDateControl  = control.get('endDate');
      //start date
      if (startDateControl && startDateControl.value) {
        const oldDate = startDateControl.value;
        const newdates = oldDate.split('-');
        if (newdates.length === 3) {
          const newDate = `${year}-${newdates[1]}-${newdates[2]}`;
          startDateControl.setValue(newDate); // Update the value
        }
      }
      if (startDateControl) {
        startDateControl.setValidators([
          Validators.required,
          this.yearRangeValidator(this.minDate, this.maxDate)
        ]);
        startDateControl.updateValueAndValidity();
      }
      //end data
      if (endDateControl && endDateControl.value) {
        const oldDate = endDateControl.value;
        const newdates = oldDate.split('-');
        if (newdates.length === 3) {
          const newDate = `${year}-${newdates[1]}-${newdates[2]}`;
          endDateControl.setValue(newDate); // Update the value
        }
      }
      if (endDateControl) {
        endDateControl.setValidators([
          Validators.required,
          this.yearRangeValidator(this.minDate, this.maxDate)
        ]);
        endDateControl.updateValueAndValidity();
      }
    });
  }

  yearRangeValidator(min: string, max: string): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;
      return value >= min && value <= max ? null : { outOfRange: true };
    };
  }

  

  navigate() {
    this.router.navigate(['/settings/employee-fields/manage-dsts']);
  }
  inititializeForm() {
    const currentYear = new Date().getFullYear();
    this.dstForm = this.fb.group({
      year: [currentYear,Validators.required],
      location: [null, Validators.required],
      subLocation: [{value: '', disabled: true}, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      momentRows: this.fb.array([this.createMomentRow()]), // initialize with one row
    });
  }

  private getAllLocations(): void {
    this.http
      .getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => (this.locationDetails = res.jobLocations || []),
        error: (err) => console.error('Error fetching locations:', err),
      });
  }

  createMomentRow(): FormGroup {
    return this.fb.group({
      startDate: ['', [Validators.required, this.yearRangeValidator(this.minDate, this.maxDate)]],
      endDate: ['', [Validators.required, this.yearRangeValidator(this.minDate, this.maxDate)]],
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
    } else {
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
    let yearsList: number[] = [];
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.dstForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.dstForm.get('subLocation')?.enable();
      this.dstForm.get('subLocation')?.reset();
    }
  }

  openConfirmation(){
    this.modalService.open(this.confirmation, {centered: true, backdrop: 'static'})
  }

  private handleFormValueChanges(): void {
    const form = this.dstForm;

    const resetAndDisable = (controls: string[]) => {
      controls.forEach(control => {
        form.get(control)?.reset();
        form.get(control)?.disable();
      });
    };

    form.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('location')?.reset();
        resetAndDisable(['subLocation', 'shift']);
      });

    form.get('location')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['subLocation', 'shift']);
      });

    form.get('subLocation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['shift']);
      });
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
    this.minDate = event;
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

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id,
    };

    this.http
      .getDataWithQueryParams(`orgShifts/getshiftlocation`, params)
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
 closeAddDST(){
  this.modalService.dismissAll();
  this.navigate();
 }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
