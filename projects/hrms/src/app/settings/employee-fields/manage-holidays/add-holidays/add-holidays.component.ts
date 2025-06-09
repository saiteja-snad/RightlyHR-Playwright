import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { forkJoin, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-add-holidays',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-holidays.component.html',
  styleUrl: './add-holidays.component.scss'
})

export class AddHolidaysComponent {
  subscription!: Subscription;
  holidayForm!: FormGroup;
  jobLocationDropDownData: any = [];
  subLocationsDropdown: any = [];
  empinfo: any;
  yearDetails: any[] = [];
  previousTab: string = '';
  selectedYear: any = null;
  minHolidayDate: string = '';
  maxHolidayDate: string = '';
  years: number[] = [];
  groupedLocationData: any[] = [];
  shiftDropdown: any[] = []; // To store the dynamically fetched shifts
  isDuplicateholidayName: boolean[] = [];
  constructor(private fb: FormBuilder, public router: Router, private http: HttpService, private confirmation: OpenModalService, private modalService: NgbModal) { }

  //ngoninit method start
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getjobLocationList();
    const currentYear = new Date().getFullYear();
    this.holidayForm = this.fb.group({
      year: [{ name: currentYear, value: currentYear },Validators.required],
      location: [null, Validators.required],
      subLocation: [{ value: null, disabled: true }, Validators.required],
      shift: [{ value: null, disabled: true }, Validators.required],
      holidays: this.fb.array([]),// start empty
    });
    this.yearDetails = this.generateYears(currentYear-1, currentYear+1);
    // Add one default row after form is ready
    this.addMomentRow();
    // year onchange method 
    this.holidayForm.get('year')?.valueChanges.subscribe((selectedYear: any) => {
      if (selectedYear?.value) {
        this.setDateLimitsForYear(selectedYear.value);
      }
    });
    // Set initial date limits
    this.setDateLimitsForYear(currentYear);
  }

  //this method used for selected year show when user change yr in dropdown
  setDateLimitsForYear(year: number): void {
    this.minHolidayDate = `${year}-01-01`;
    this.maxHolidayDate = `${year}-12-31`;

    this.holidays.controls.forEach(control => {
      const dateControl = control.get('holidayDate');
      if (dateControl && dateControl.value) {
        const oldDate = dateControl.value;
        const newdates = oldDate.split('-');
        if (newdates.length === 3) {
          const newDate = `${year}-${newdates[1]}-${newdates[2]}`;
          dateControl.setValue(newDate); // Update the value
        }
      }
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

//generate years
  generateYears(startYear: number, endYear: number) {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({ name: year, value: year });
    }
    return years;
  }
  get holidays(): FormArray {
    return this.holidayForm.get('holidays') as FormArray;
  }

  //formarray validation handel
  addHolidayRow() {
    return this.fb.group({
      holidayName: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      holidayDate: ['', [Validators.required, this.yearRangeValidator(this.minHolidayDate, this.maxHolidayDate)]],
      isOptional: [false]
    });
  }

  //add holiday button click method works
  addMomentRow() {
    const control = this.addHolidayRow();
    this.holidays.push(control);
  }

// this function used for duplicate holiday name not allowed

 isDuplicateHoliday(index: number): boolean {
  const holidayArray = this.holidayForm.get('holidays') as FormArray; 
  const currentholiday = holidayArray.at(index).value;
  return holidayArray.controls.some((ctrl, i) => {
    if (i === index) return false;
    const shift = ctrl.value;
    return (
      shift.holidayName?.trim().toLowerCase() === currentholiday.holidayName?.trim().toLowerCase()
    );
  });
}
checkDuplicate(): void {
  const holidayArray = this.holidayForm.get('holidays') as FormArray;
  const names = holidayArray.controls.map(ctrl =>
    ctrl.value.holidayName?.trim().toLowerCase()
  );
  const seen = new Map<string, number>(); // Map to track first occurrence
  this.isDuplicateholidayName = names.map((name, idx) => {
    if (!name) return false;
    if (seen.has(name)) {
      return true; // duplicate — not first occurrence
    } else {
      seen.set(name, idx);
      return false; // first occurrence — valid
    }
  });
}


  // Delete icon button click method
  removeHolidayRow(index: number) {
    this.holidays.removeAt(index);
  }

  // onTabChange changes
  onTabChange(event: any) {
    const tabLabel = event.originalEvent.target.innerText.trim();
    if (tabLabel !== this.previousTab) {
      if (tabLabel === 'Optional Holidays') {
      } else if (tabLabel === 'Holidays') {
      } else {
        this.selectedYear = new Date().getFullYear();
      }
      this.previousTab = tabLabel;
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
      subLocationId: formValue.subLocation,
      applicableyear: formValue.year?.value,
      addedby: parseInt(this.empinfo.employeeId),
      addedDate: new Date().toISOString(),
      status: 'Pending for submission',
      authorizedDate: new Date().toISOString(),
      authorizedstatus: 'string',
      shiftID: formValue.shift,
      lastModifedby: parseInt(this.empinfo.employeeId),
      lastModifeddate: new Date(),
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
        this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
      },
      error: (error) => {
        if (error.error) {
          this.confirmation.openErrorModal("Holidays already exixts with selected year, location, sublocation and shift!");
        }
      }
    });
  }
  // post method execution end

  // getjobLocationList it is used for location dropdown list show
  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        // Fetch sub-locations for each location
        const subLocationRequests = locations.map((location: { id: any; }) =>
          this.http.getData(`JobLocation/sub-location-by-joblocation/${location.id}`)
        );
        forkJoin(subLocationRequests).subscribe({
          next: (subLocationResults: any) => {
            this.groupedLocationData = locations.map((location: { jobLocationName: any; id: any; }, index: string | number) => ({
              jobLocationName: location.jobLocationName,
              jobLocationId: location.id,
              subLocations: subLocationResults[index]?.jobSubLocations || []
            }));
          }
        });
      }
    });
  }

  // getSubLocationByid this method used for sublocation list show in dropdown
  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation.id) {
      // Reset subLocation and shift fields when location changes
      this.holidayForm.patchValue({
        subLocation: null,
        shift: null
      });
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
       this.holidayForm.get('subLocation')?.markAsTouched();
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.subLocationsDropdown = [];
            this.holidayForm.get('subLocation')?.enable();
            this.holidayForm.get('shift')?.disable()
          } else {
            this.holidayForm.get('subLocation')?.enable();
            this.subLocationsDropdown = data.jobSubLocations;
            this.holidayForm.get('shift')?.disable()
          }
        },
        error: (error: any) => {
          if (error.error) {
            this.confirmation.openErrorModal(error.error.Message);
          }
        },
      });
    } else {
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
    }
  }
 
getShiftBYid(selectedSubLocation: any): void {
  const formValue = this.holidayForm.value;
  if (selectedSubLocation) {
    const locationId = formValue.location?.id;
    const subLocationId = selectedSubLocation;

    this.subscription = this.http
      .getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`)
      .subscribe({
        next: (data: any) => {
          const shiftControl = this.holidayForm.get('shift');

          if (data.length === 0) {
            this.shiftDropdown = [];          
            shiftControl?.reset();             
            shiftControl?.enable();           
            shiftControl?.markAsTouched();      
            shiftControl?.updateValueAndValidity(); 
          } else {
            this.shiftDropdown = [].concat(
              ...data.map((element: any) => element.orgShiftsItems)
            );
            shiftControl?.reset();              
            shiftControl?.enable();
            shiftControl?.markAsTouched();      
            shiftControl?.updateValueAndValidity(); 
          }
        },
        error: () => {
          const shiftControl = this.holidayForm.get('shift');
          this.shiftDropdown = [];
          shiftControl?.reset();
          shiftControl?.enable();
          shiftControl?.markAsTouched();
          shiftControl?.updateValueAndValidity();
        },
      });
  } else {
    const shiftControl = this.holidayForm.get('shift');
    this.shiftDropdown = [];
    shiftControl?.reset();
    shiftControl?.disable(); // optional
  }
}
  //getShiftBYid  method end

  //cancel button click open modal dailog
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  // cancel dailog yes button click method start
  cancel() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  // cancel dailog yes button click method end

  //cancel dailog no button click method start
  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }
  //cancel dailog no button click method end

  //component destroy
  ngOnDestroy() {

  }
}
