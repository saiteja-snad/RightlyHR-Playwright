import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { ILocation, IShiftHeader, ISubLocation } from '../pending-weekends/weekends.model';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-weekend',
  imports: [CommonModule, SelectModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './add-weekend.component.html',
  styleUrl: './add-weekend.component.scss'
})

export class AddWeekendComponent implements OnInit, OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  weekendForm!: FormGroup;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  currentYear: number = new Date().getFullYear();
  employeedetails = {} as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  daysList = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.employeedetails = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}')
    this.initializeForm();
    this.handleFormValueChanges();
    this.getAllYears();
    this.getAllLocations();
  }

  navigate() {
    this.router.navigate(['/settings/employee-fields/manage-weekends']);
  }

  initializeForm() {
    this.weekendForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: ['', Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      weekends: this.fb.array([this.createWeekend()])
    })
  }

  createWeekend(): FormGroup {
    return this.fb.group({
      day: ['', Validators.required],
      week1: [false],
      week2: [false],
      week3: [false],
      week4: [false],
      week5: [false]
    }, { validators: this.atLeastOneWeekSelected()});
  }

  get weekends(): FormArray {
    return this.weekendForm.get('weekends') as FormArray;
  }

  addWeekend(): void {
    if (this.weekends.length < 3) {
      this.weekends.push(this.createWeekend());
    } else {
      console.warn('Maximum of 7 weekends can be added.');
    }
  }

  removeWeekend(index: number): void {
    this.weekends.removeAt(index);
  }

  atLeastOneWeekSelected(): ValidatorFn {
    return (control: AbstractControl) => {
      const week1 = control.get('week1')?.value;
      const week2 = control.get('week2')?.value;
      const week3 = control.get('week3')?.value;
      const week4 = control.get('week4')?.value;
      const week5 = control.get('week5')?.value;
  
      const atLeastOneChecked = week1 || week2 || week3 || week4 || week5;
  
      return atLeastOneChecked ? null : { atLeastOneWeekRequired: true };
    };
  }

  getAllYears() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.yearsList.push(i);
    }
  }

  getAvailableDays(index: number): { label: string; value: string; disabled: boolean }[] {
    const selectedDays = this.weekends.controls
      .map((group, i) => i !== index ? group.get('day')?.value : null)
      .filter(Boolean);
  
    return this.daysList.map(day => ({
      label: day,
      value: day,
      disabled: selectedDays.includes(day)
    }));
  }
  
  private getAllLocations(): void {
    this.http.getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => this.locationDetails = res.jobLocations || [],
        error: err => console.error('Error fetching locations:', err)
      });
  }

  enableLocation(): void {
    if (this.weekendForm.get('year')?.value) {
      this.weekendForm.get('location')?.enable();
    }
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.weekendForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.weekendForm.get('subLocation')?.enable();
      this.weekendForm.get('subLocation')?.reset();
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id
    };

    this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
          this.weekendForm.get('shift')?.enable();
        },
        error: err => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.weekendForm.get('shift')?.reset();
          this.weekendForm.get('shift')?.disable();
        }
      });
  }

  private handleFormValueChanges(): void {
    const form = this.weekendForm;

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

  postWeekend(form: FormGroup) {
    if (form.invalid) {
      form.markAsTouched();
      return;
    }

    const formData = form.value;

    const payload = {
      locationId: formData.location.id,
      subLocationId: formData.subLocation.id,
      shiftID: formData.shift.id,
      applicableyear: formData.year,
      status: "Pending for submission",
      addedby: this.employeedetails.employeeId,
      addedDate: new Date(),
      authorizedby: this.employeedetails.employeeId,
      authorizedDate: new Date(),
      authorizedstatus: "string",
      lastModifedby: this.employeedetails.employeeId,
      lastModifeddate: new Date(),
      orgWeekendItems: formData.weekends.map((row: any) => ({
        weekday: row.day,
        firstweek: row.week1,
        secondweek: row.week2,
        thirdweek: row.week3,
        fourthweek: row.week4,
        fifthweek: row.week5,
        status: 'Pending for submission'
      }))
    }
    this.http.postdata('OrgWeekendHeader/Post/OrgWeekEnd', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modal.openSuccessModal('Weekends Created Successfully!')
        setTimeout(() => {
         this.closeWeekend();
        }, 2000)
      },
      error: (err: any) => {
        this.modal.openErrorModal(err.error.message ? err.error.message : 'Failed to create weekends!')
      }
    });
  }

  Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }
  
  onDelete(modal: any) {
    modal.dismiss();
    this.navigation();
  }

  openModal(content: any,) {
    this.modalService.open(content, { centered: true })
  }

  closeWeekend(){
    this.modalService.dismissAll();
    this.navigate();
  }
  navigation(){
    this.router.navigate(['/settings/employee-fields/manage-weekends/pending-for-submission']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}