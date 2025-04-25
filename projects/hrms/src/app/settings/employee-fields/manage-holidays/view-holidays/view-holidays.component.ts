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
  selector: 'app-view-holidays',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule],
  templateUrl: './view-holidays.component.html',
  styleUrl: './view-holidays.component.scss'
})

export class ViewHolidaysComponent {
  subscription!: Subscription;
  holidayForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updateHolidaysData: any;
  subLocationsDropdown: any = [];
  empinfo: any;
  yearDetails = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
  ]

  constructor(private fb: FormBuilder, public router: Router, private http: HttpService, private confirmation: OpenModalService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('viewholidays') ?? '{}');
    this.getjobLocationList();
    this.holidayForm = this.fb.group({
      year: [null, Validators.required],
      location: [null, Validators.required],
      subLocation: [null, Validators.required],
      shift: [null, Validators.required],
      holidays: this.fb.array([])
    });
    this.holidayForm.patchValue({
      year: this.yearDetails.find((x: any) => x.value === this.updateHolidaysData.applicableyear),
    });
    this.updateHolidaysData.orgHolidaysItems.forEach((row: any) => {
      this.holidays.push(
        this.fb.group({
          holidayName: row.holidayName,
          holidayDate: moment(row.holidayDate).format('YYYY-MM-DD'),
          isOptional: row.isOptional
        })
      );
    });
  }

  get holidays(): FormArray {
    return this.holidayForm.get('holidays') as FormArray;
  }

  addHolidayRow() {
    const holidayGroup = this.fb.group({
      holidayName: [''],
      holidayDate: [''],
      isOptional: [false]
    });
    this.holidays.push(holidayGroup);
  }

  removeHolidayRow(index: number): void {
    if (this.holidays.length > 1) {
      this.holidays.removeAt(index);
    }
  }

  hidePublishCloneButtons: boolean = false
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
        this.confirmation.openSuccessModal('Holidays updated successfully');
      },
      error: (err) => {
        this.confirmation.openErrorModal('Holidays update failed');
      }
    });
  }

  cancel() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

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
        this.confirmation.openSuccessModal('Holidays published successfully');
      },
      error: (err) => {
        this.confirmation.openErrorModal('Holidays published failed');
      }
    });
  }

  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        this.holidayForm.patchValue({
          location: this.jobLocationDropDownData.find((x: any) => x.jobLocationName === this.updateHolidaysData.locationName),
        });
        this.getSubLocationByid(this.updateHolidaysData.locationId)
      }
    });
  }

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.subLocationsDropdown = [];
          } else {
            this.subLocationsDropdown = data.jobSubLocations;
          }
          this.holidayForm.patchValue({
            subLocation: this.subLocationsDropdown.find((x: any) => x.jobSubLocationName === this.updateHolidaysData.subLocationName),
          });
          const shiftdata = {
            locid: this.updateHolidaysData.locationId,
            sublocid: this.updateHolidaysData.subLocationId
          }
          this.getShiftBYid(shiftdata);
        },
        error: (err: any) => {
        },
      });
    } else {
      this.subLocationsDropdown = [];
    }
  }

  shiftDropdown: any[] = [];
  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.holidayForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId = formValue.location?.id
      const subLocationId = this.updateHolidaysData.subLocationId ?? selectedSubLocation
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.shiftDropdown = []; // Reset if no shifts are found
          } else {
            this.shiftDropdown = [].concat(
              ...data.map((element: any) => element.orgShiftsItems)
            ); // Flatten the shift data
          }
          this.holidayForm.patchValue({
            shift: this.shiftDropdown.find((x: any) => x.id === this.updateHolidaysData.shiftID),
          });
        },
        error: (err: any) => {
          this.shiftDropdown = []; // Reset on error
        },
      });
    } else {
      this.shiftDropdown = []; // Reset if no sub-location is selected
    }
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  ngOnDestroy() {
  }
}
