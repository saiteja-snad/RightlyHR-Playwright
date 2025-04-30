import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, public router: Router, private http: HttpService, private confirmation: OpenModalService, private modalService: NgbModal) { }

  //ngoninit method start
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('updateholidays') ?? '{}');
    const currentYear = new Date().getFullYear();
    this.yearDetails = this.generateYears(2000, currentYear);
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
          holidayName: [row.holidayName || '', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]],
          holidayDate: moment(row.holidayDate).format('YYYY-MM-DD'),
          isOptional: row.isOptional
        })
      );
    });
    console.log(this.updateHolidaysData);
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
      holidayName: ['', [Validators.required, Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z ]*$/)]],
      holidayDate: ['', Validators.required],
      isOptional: [false]
    });
    this.holidays.push(holidayGroup);
    this.hidePublishCloneButtons = true;
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
      subLocationId: formValue.subLocation.id ?? this.updateHolidaysData.subLocationId,
      applicableyear: formValue.year?.value ?? this.updateHolidaysData.applicableyear,
      addedby: parseInt(this.empinfo.employeeId) ?? this.updateHolidaysData.addedby,
      addedDate: new Date().toISOString() ?? this.updateHolidaysData.addedDate,
      status: this.updateHolidaysData.status,
      authorizedDate: new Date().toISOString() ?? this.updateHolidaysData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift.id ?? this.updateHolidaysData.shiftID,
      id: this.updateHolidaysData.id,
      orgHolidaysItems: formValue.holidays.map((item: any) => ({
        holidayName: item.holidayName,
        holidayDate: item.holidayDate,
        isOptional: item.isOptional,
        status: 'Published',
        holidayColor: 'string',
        headerID: this.updateHolidaysData?.orgHolidaysItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgHolidays/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Holidays updated successfully');
        this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Holidays update failed');
      }
    });
    console.log(payload);
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
    const formValue = this.holidayForm.value;
    const payload = {
      locationId: formValue.location?.id ?? this.updateHolidaysData.locationId,
      subLocationId: formValue.subLocation.id ?? this.updateHolidaysData.subLocationId,
      applicableyear: formValue.year?.value ?? this.updateHolidaysData.applicableyear,
      addedby: parseInt(this.empinfo.employeeId) ?? this.updateHolidaysData.addedby,
      addedDate: new Date().toISOString() ?? this.updateHolidaysData.addedDate,
      status: 'Published',
      authorizedDate: new Date().toISOString() ?? this.updateHolidaysData.authorizedDate,
      authorizedstatus: 'string',
      shiftID: formValue.shift.id ?? this.updateHolidaysData.shiftID,
      id: this.updateHolidaysData.id,
      orgHolidaysItems: formValue.holidays.map((item: any) => ({
        holidayName: item.holidayName,
        holidayDate: item.holidayDate,
        isOptional: item.isOptional,
        status: 'Published',
        holidayColor: 'string',
        headerID: this.updateHolidaysData?.orgHolidaysItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgHolidays/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Holidays published successfully');
        this.router.navigate(['/settings/employee-fields/manage-holidays/published-holidays']);
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Holidays published failed');

      }
    });
    console.log(payload);
  }

  ////this method used for location list show in location dropdown 
  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        console.log(this.jobLocationDropDownData);
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
