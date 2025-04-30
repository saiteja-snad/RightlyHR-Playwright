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
  isDisabled = false;
  yearDetails: any[] = [];
  shiftDropdown: any[] = [];

  constructor(private fb: FormBuilder, public router: Router, private http: HttpService, private confirmation: OpenModalService, private modalService: NgbModal) { }
// ng oninit method start
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('viewholidays') ?? '{}');
    this.getjobLocationList();
    const currentYear = new Date().getFullYear();
    this.yearDetails = this.generateYears(2000, currentYear);
    this.holidayForm = this.fb.group({
      year: [{value : '', disabled : true}, Validators.required],
      location: [{value : '', disabled : true},, Validators.required],
      subLocation: [{value : '', disabled : true},, Validators.required],
      shift: [{value : '', disabled : true},, Validators.required],
      holidays: this.fb.array([])
    });
    this.holidayForm.patchValue({
      year: this.yearDetails.find((x: any) => x.value === this.updateHolidaysData.applicableyear),
    });
    this.updateHolidaysData.orgHolidaysItems.forEach((row: any) => {
      this.holidays.push(
        this.fb.group({
          holidayName: [{ value: row.holidayName, disabled: true }],
          holidayDate: [{ value: moment(row.holidayDate).format('YYYY-MM-DD'), disabled: true }],
          isOptional: [{ value: row.isOptional, disabled: true }]
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
//get holidys method
  get holidays(): FormArray {
    return this.holidayForm.get('holidays') as FormArray;
  }
//cancel button  yes click navigate page
  cancel() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/published-holidays']);
  }

  ////cancel button  yes click open dailog
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

 //this mthiod use for location list
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

 //this mthiod use for sub location list
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

 //this mthiod use for shiftname  list
 
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
          this.shiftDropdown = []; 
        },
      });
    } else {
      this.shiftDropdown = []; 
    }
  }
  //
 //this mthiod use for clone button click
  clone(){
    this.router.navigate(['/settings/employee-fields/cloneholidays']);
  }
  //cancel button click navigation
  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  ngOnDestroy() {
  }
}
