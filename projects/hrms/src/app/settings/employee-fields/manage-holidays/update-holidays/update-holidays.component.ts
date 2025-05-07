import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-holidays',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule],
  templateUrl: './update-holidays.component.html',
  styleUrl: './update-holidays.component.scss'
})
export class UpdateHolidaysComponent {
  subscription!: Subscription;
  holidayForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updateHolidaysData: any;
  subLocationsDropdown: any = [];
  hidePublishCloneButtons: boolean = false;
  empinfo: any;
  yearDetails: any[] = [];
  isdisabled = true;
  shiftDropdown: any[] = [];
  isDuplicateholidayName: boolean[] = [];
  constructor(private fb: FormBuilder, public router: Router, private http: HttpService, private confirmation: OpenModalService, private modalService: NgbModal) { }

  //ngoninit method start
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('updateholidays') ?? '{}');
    const currentYear = new Date().getFullYear();
    this.yearDetails = this.generateYears(2000, currentYear+1);
    this.getjobLocationList();
    this.holidayForm = this.fb.group({
      year: [{ value: '', disabled: true }, Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      shift: ['', Validators.required],
      holidays: this.fb.array([])
    });
    //default year show selected
    this.holidayForm.patchValue({
      year: this.yearDetails.find((x: any) => x.value === this.updateHolidaysData.applicableyear)

    });

    // it is used for validation 
    this.updateHolidaysData.orgHolidaysItems.forEach((row: any) => {
      this.holidays.push(
        this.fb.group({
          holidayName: [row.holidayName || '',[Validators.required, Validators.pattern(/^[^\s].*$/)],],
          holidayDate: moment(row.holidayDate).format('YYYY-MM-DD'),
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

  // holiday get 
  get holidays(): FormArray {
    return this.holidayForm.get('holidays') as FormArray;
  }
  //min date selected
  getMinDateForHoliday(): string {
    const selectedYear = this.holidayForm.get('year')?.value?.value;
    if (selectedYear) {
      return `${selectedYear}-01-01`;
    }
    return moment().format('YYYY-MM-DD'); // fallback
  }
  //max date selected
  getMaxDateForHoliday(): string {
    const selectedYear = this.holidayForm.get('year')?.value?.value;
    if (selectedYear) {
      return `${selectedYear}-12-31`;
    }
    return moment().format('YYYY-MM-DD'); // fallback
  }

  // this method used for add holiday button click  
  addHolidayRow() {
    const holidayGroup = this.fb.group({
      holidayName: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      holidayDate: ['', Validators.required],
      isOptional: [false]
    });
    this.holidays.push(holidayGroup);
    this.hidePublishCloneButtons = true;
    const index = this.holidays.length - 1;
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

get holidaysArray(): FormArray {
  return this.holidayForm.get('holidays') as FormArray;
}
  //delete icon click this method works
  removeHolidayRow(index: number): void {
    if (this.holidays.length > 1) {
      this.holidays.removeAt(index);
    }
  }

  //  ////this method used for sublocation change blank the shift name 
  onsubLocationChange(selectedsubLocation: any): void {
    if (selectedsubLocation) {
      // Clear subLocation and shift
      this.holidayForm.patchValue({
        shift: ''
      });
      this.shiftDropdown = [];
      this.getShiftBYid(selectedsubLocation.id);
    } else {
      this.shiftDropdown = [];
      this.holidayForm.patchValue({
        shift: ''
      });
    }
  }

  ////this method used for location change blank the sublocation,shift name 
  onLocationChange(selectedLocation: any): void {
    if (selectedLocation) {
      this.holidayForm.patchValue({
        subLocation: '',
        shift: ''
      });
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];

      this.getSubLocationByid(selectedLocation.id, false);
    } else {
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];
      this.holidayForm.patchValue({
        subLocation: '',
        shift: ''
      });
    }
  }

  //this method used for update button click 
  submit() {

    const formValue = this.holidayForm.value;
    const payload = {
      locationId: formValue.location?.id ?? this.updateHolidaysData.locationId,
      locationName: formValue.location?.locationName ??this.updateHolidaysData.locationName,
      subLocationId: formValue.subLocation.id ?? this.updateHolidaysData.subLocationId,
      applicableyear: formValue.year?.value ?? this.updateHolidaysData.applicableyear,
      subLocationName: formValue.location?.subLocationName ??this.updateHolidaysData.subLocationName,
      addedby: parseInt(this.empinfo.employeeId) ?? this.updateHolidaysData.addedby,
      shiftName: this.updateHolidaysData.shiftName,
      addedDate: new Date().toISOString() ?? this.updateHolidaysData.addedDate,
      authorizedby: parseInt(this.empinfo.employeeId) ??this.updateHolidaysData.employeeId,
      status: this.updateHolidaysData.status,
      authorizedDate: new Date().toISOString() ?? this.updateHolidaysData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift.id ?? this.updateHolidaysData.shiftID,
      jobSubLocationName: this.updateHolidaysData.jobSubLocationName,
      addedbyName: this.updateHolidaysData.addedbyName,
      authorizedbyName: this.updateHolidaysData.authorizedbyName,
      lastModifedby: parseInt(this.empinfo.employeeId)??this.updateHolidaysData.employeeId,
      lastModifeddate: new Date(),
      jobLocationName: this.updateHolidaysData.jobLocationName,
      id: this.updateHolidaysData.id,
      orgHolidaysItems: formValue.holidays.map((item: any) => ({
        holidayName: item.holidayName,
        holidayDate: item.holidayDate,
        isOptional: item.isOptional,
        status: 'Submitted',
        holidayColor: 'string',
        headerID: this.updateHolidaysData?.orgHolidaysItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgHolidays/Update', payload).subscribe({
      next: (response: any) => {
        this.confirmation.openSuccessModal('Holidays updated successfully');
        this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
      },
      error: (err) => {
        this.confirmation.openErrorModal('Holidays update failed');
      }
    });
  }

  //this method used for close dailog no button click 
  cancel() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  //this method used for close button  click open dalog close
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  ////this method used for clone button click 
  clone() {
    this.router.navigate(['/settings/employee-fields/cloneholidays']);
  }

  //this method used for publish button click 
  publish() {
    let publishItem = {
      Category: 'holidays',
      refentityId: this.updateHolidaysData?.orgHolidaysItems?.[0]?.headerID,
    }
    this.subscription = this.http.postdata(`CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`, { params: publishItem }).subscribe({
      next: (respnose: any) => {
        this.confirmation.openSuccessModal('Holidays Published successfully');
        setTimeout(() => {
          this.nagvition();
        }, 2000);
      },
      error: (error: any) => {
        // Handle error if needed
        console.error(error);
        if (error.error) {
          this.confirmation.openErrorModal(error.error.Message);
        }
      },
    })
  }
  ////this method used for location list show in location dropdown 
  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        this.holidayForm.patchValue({
          location: this.jobLocationDropDownData.find((x: any) => x.jobLocationName === this.updateHolidaysData.locationName),
        });
        // this.subLocationsDropdown = [];
        this.getSubLocationByid(this.updateHolidaysData.locationId)
      }
    });

  }



  ////this method used for sublocation list show in sublocation dropdown 
  getSubLocationByid(selectedLocation: any, patchForm: boolean = true): void {
    if (selectedLocation) {
      this.subscription = this.http
        .getData(`JobLocation/sub-location-by-joblocation/${selectedLocation}`)
        .subscribe({
          next: (data: any) => {
            this.subLocationsDropdown = data.jobSubLocations || [];
            this.holidayForm.get('shift')?.disable();
            if (patchForm) {
              this.holidayForm.patchValue({
                subLocation: this.subLocationsDropdown.find(
                  (x: any) => x.jobSubLocationName === this.updateHolidaysData.subLocationName
                ),
              });
              const shiftdata = {
                locid: this.updateHolidaysData.locationId,
                sublocid: this.updateHolidaysData.subLocationId,
              };
              this.getShiftBYid(shiftdata, true);
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
    }
  }
  ////this method used for shifts list show in shiftname dropdown 
  getShiftBYid(selectedSubLocation: any, patchForm: boolean = true): void {
    const formValue = this.holidayForm.value;
    const locationId = formValue.location?.id;
    const subLocationId = selectedSubLocation?.id ?? selectedSubLocation;

    this.subscription = this.http
      .getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId.sublocid || subLocationId.value.id}`)
      .subscribe({
        next: (data: any) => {
          this.holidayForm.get('shift')?.enable();
          this.shiftDropdown = [].concat(...data.map((element: any) => element.orgShiftsItems));

          if (patchForm) {
            this.holidayForm.patchValue({
              shift: this.shiftDropdown.find((x: any) => x.id === this.updateHolidaysData.shiftID),
            });
          }
        },
        error: (err: any) => {
          this.shiftDropdown = [];
        },
      });
  }

  //this method used for after submit data navigate to main page
  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  ngOnDestroy() {

  }
}
