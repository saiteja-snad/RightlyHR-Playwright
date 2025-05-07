import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-clone-holidays',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule],
  templateUrl: './clone-holidays.component.html',
  styleUrl: './clone-holidays.component.scss'
})
export class CloneHolidaysComponent {
  subscription!: Subscription;
  holidayForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updateHolidaysData: any;
  subLocationsDropdown: any = [];
  empinfo: any;
  yearDetails: any[] = [];
  selectedYear: any = null;
  minHolidayDate: string = '';
  maxHolidayDate: string = '';
  shiftDropdown: any[] = [];
  hidePublishCloneButtons: boolean = false;

  constructor(private fb: FormBuilder, public router: Router, private confirmation: OpenModalService, private http: HttpService, private modalService: NgbModal) { }

  // ng oninit method start
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('updateholidays') || '{}');
    this.getjobLocationList();
    const currentYear = new Date().getFullYear();
    this.yearDetails = this.generateYears(2000, currentYear);
    this.holidayForm = this.fb.group({
      year: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      holidays: this.fb.array([])
    });

    this.holidayForm.patchValue({
      year: this.yearDetails.find((x: any) => x.value === this.updateHolidaysData.applicableyear),
    });

    const selectedYear = this.updateHolidaysData?.applicableyear || new Date().getFullYear();
    this.setDateLimits(selectedYear);
  
    // year changes method is triggering
    this.holidayForm.get('year')?.valueChanges.subscribe((yearObj: any) => {
      if (yearObj?.value) {
        this.setDateLimits(yearObj.value);
      }
    });

    //it is used for by default selected yr year show in manage holidays
    this.holidayForm.get('year')?.valueChanges.subscribe((selectedYear: any) => {
      if (selectedYear?.value) {
        const year = selectedYear.value;
        this.setDateLimits(year);
        this.holidays.controls.forEach((group: AbstractControl) => {
          const currentDate = group.get('holidayDate')?.value;
          if (currentDate) {
            const [oldYear, month, day] = currentDate.split('-');
            const newDate = `${year}-${month}-${day}`;
            group.get('holidayDate')?.setValue(newDate);
          }
        });
      }
    });
    this.setDateLimits(selectedYear);

    // mandetory field validation handle here
    this.updateHolidaysData.orgHolidaysItems.forEach((row: any) => {
      this.holidays.push(
        this.fb.group({
          holidayName: [row.holidayName || '', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]],
          holidayDate: [moment(row.holidayDate).format('YYYY-MM-DD'),[Validators.required,this.yearRangeValidator(this.minHolidayDate,this.maxHolidayDate)]],
          isOptional: row.isOptional
        })
      );
    });
  }
  // this method used for year generate dynamically 
  generateYears(startYear: number, endYear: number) {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ name: year, value: year });
    }
    return years;
  }

  // this method used for year change selected yr month show in manage holiday date
  setDateLimits(year: number): void {
    this.minHolidayDate = `${year}-01-01`;
    this.maxHolidayDate = `${year}-12-31`;
    this.holidays.controls.forEach(control => {
      const dateControl = control.get('holidayDate');
      if (dateControl) {
        dateControl.setValidators([
          Validators.required,
          this.yearRangeValidator(this.minHolidayDate, this.maxHolidayDate)
        ]);
        dateControl.updateValueAndValidity();
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

  get holidays(): FormArray {
    return this.holidayForm.get('holidays') as FormArray;
  }
  // this method used for add holiday button click
  addHolidayRow() {
    const holidayGroup = this.fb.group({
      holidayName: ['',[Validators.required,Validators.required,Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]],
      holidayDate: [ '',[Validators.required, this.yearRangeValidator(this.minHolidayDate, this.maxHolidayDate)]],
      isOptional: [false]
    });
    this.holidays.push(holidayGroup);
  }

  //this method used for delete icon click
  removeHolidayRow(index: number): void {
    if (this.holidays.length > 1) {
      this.holidays.removeAt(index);
    }
  }

  // post method execution start 
  submit(holidayForm: FormGroup) {
    if (holidayForm.invalid) {
      this.holidayForm.markAllAsTouched();
      return;
    }
    const formValue = this.holidayForm.value;
    const payload = {
      locationId: formValue.location?.id,
      subLocationId: formValue.subLocation?.id,
      applicableyear: formValue.year?.value,
      addedby: parseInt(this.empinfo.employeeId),
      addedDate: new Date().toISOString(),
      status: 'Pending for submission',
      authorizedDate: new Date().toISOString(),
      authorizedstatus: 'string',
      shiftID: formValue.shift.id,
      orgHolidaysItems: formValue.holidays.map((item: any) => ({
        holidayName: item.holidayName,
        holidayDate: item.holidayDate,
        isOptional: item.isOptional,
        status: 'Submitted',
        holidayColor: 'string'
      }))
    };
    this.subscription = this.http.postdata('orgHolidays/Post', payload).subscribe({
      next: (response: any) => {
        localStorage.setItem('personaldata', JSON.stringify(response))
        this.confirmation.openSuccessModal('Holidays added successfully');
        setTimeout(() => {
          this.closeWeekend();
         }, 2000)
        this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
      },
      error: (error) => {
        if (error.error) {
          this.confirmation.openErrorModal(error.error.Message);
        }
      }
    });
  }
  // post method execution end
  closeWeekend() {
    this.modalService.dismissAll();
    //this.navigate();
    localStorage.removeItem('updateholidays');
  }

  // this method  used for cancel button no button click navigate page
  cancel() {
  this.nagvition();
    //this.router.navigate(['/settings/employee-fields/manage-holidays/published-holidays']);
  }
  
  // this method  used for cancel  button click open dailog
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  //this method used for location list show in location dropdown
  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        this.holidayForm.patchValue({
          location: this.jobLocationDropDownData.jobLocationName
        });
        this.getSubLocationByid(this.updateHolidaysData.locationId)
      }
    });
  }

  //this method used for sublocation list show in location dropdown
  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation) {
      // Reset subLocation and shift fields when location changes
      this.holidayForm.patchValue({
        subLocation: null,
        shift: null
      });
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
      this.subscription = this.http
        .getData(
          `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
        )
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.holidayForm.get('subLocation')?.enable();
              this.holidayForm.get('shift')?.disable()
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations;
              this.shiftDropdown = [];
              this.holidayForm.get('subLocation')?.enable();
              this.holidayForm.get('shift')?.disable()
            }       
          },
          error: (err: any) => {
          },
        });
    } else {
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
    }
  }
  //this method used for location and sublocation wise show shifts in shiftsname dropdown
  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.holidayForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId = formValue.location?.id
      const subLocationId = formValue.subLocation.id ?? selectedSubLocation
      this.subscription = this.http
        .getData(
          `orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`
        )
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.holidayForm.get('shift')?.enable()
              this.shiftDropdown = []; 
            } else {
              this.holidayForm.get('shift')?.enable()
              this.shiftDropdown = [].concat( ...data.map((element: any) => element.orgShiftsItems)
              ); 
            }         
          },
          error: (err: any) => {
            this.shiftDropdown = []; 
          },
        });
    } else {
      this.shiftDropdown = []; 
    }
  }

  // this method is used for after submit data navigate main page 
  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  ngOnDestroy() {
 if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
