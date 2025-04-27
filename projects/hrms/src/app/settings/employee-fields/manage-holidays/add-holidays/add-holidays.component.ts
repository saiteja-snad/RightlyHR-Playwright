import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { forkJoin, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
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
  constructor(private fb: FormBuilder, public router: Router, private http: HttpService, private confirmation: OpenModalService) { }

  ngOnInit(): void {
    
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getjobLocationList();
    this.holidayForm = this.fb.group({
      year: [null, Validators.required],
      location: [null, Validators.required],
      subLocation: [null, Validators.required],
      shift: [null, Validators.required],
      holidays: this.fb.array([this.addHolidayRow()]),
      
    });
    this.addHolidayRow();
    const currentYear = new Date().getFullYear();
    this.yearDetails = this.generateYears(2000, currentYear);

    // Set default selected year
    this.holidayForm.patchValue({ year: { name: currentYear, value: currentYear } });
    if (!this.holidayForm.get('year')?.value) {
      this.holidayForm.patchValue({ year: { name: currentYear, value: currentYear } });
    }
    
  }
 
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

  addHolidayRow() {
    return  this.fb.group({
      holidayName: ['',Validators.required],
      holidayDate: ['',Validators.required],
      isOptional: [false,Validators.required]
    });
  }
  addMomentRow() {
    // if (this.policies.length < 4) {
      this.holidays.push(this.addHolidayRow());
    // } else {
    // }
  }

  removeHolidayRow(index: number) {
    this.holidays.removeAt(index);
  }
  onTabChange(event: any) {
    const tabLabel = event.originalEvent.target.innerText.trim();
  
    if (tabLabel !== this.previousTab) {
      if (tabLabel === 'Optional Holidays') {
        // Keep the year
      } else if (tabLabel === 'Holidays') {
        // Keep the year
      } else {
        this.selectedYear = new Date().getFullYear();
      }
      this.previousTab = tabLabel;
    }
  }
  
  submit() {
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
      error: (err) => {
        this.confirmation.openErrorModal('Holidays added failed');
      }
    });
  }

  groupedLocationData: any[] = [];
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

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.subLocationsDropdown = [];
          } else {
            this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
          }
        },
        error: (err: any) => {
        },
      });
    } else {
      this.subLocationsDropdown = [];
    }
  }

  shiftDropdown: any[] = []; // To store the dynamically fetched shifts
  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.holidayForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId = formValue.location?.id;
      const subLocationId = selectedSubLocation;
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`).subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.shiftDropdown = []; // Reset if no shifts are found
            } else {
              this.shiftDropdown = [].concat(
                ...data.map((element: any) => element.orgShiftsItems)
              ); // Flatten the shift data
            }
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
