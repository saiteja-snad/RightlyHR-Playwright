import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { forkJoin, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../../services/open-modal.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-update-holidays',
  imports: [CommonModule,Select,ReactiveFormsModule],
  templateUrl: './update-holidays.component.html',
  styleUrl: './update-holidays.component.scss'
})
export class UpdateHolidaysComponent {
  subscription!: Subscription;
  holidayForm!: FormGroup;
  jobLocationDropDownData: any = [];
  updateHolidaysData : any;
  subLocationsDropdown: any = [];
  empinfo : any;
  yearDetails = [
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
    { name: '2027', value: 2027 },
    { name: '2028', value: 2028 },
  ]


  constructor(private fb: FormBuilder,public router:Router,private http: HttpService, private confirmation: OpenModalService) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('updateholidays') ?? '{}');

    this.getjobLocationList();
    this.holidayForm = this.fb.group({
      year: [null,Validators.required],
      location: [null,Validators.required],
      subLocation: [null,Validators.required],
      shift : [null,Validators.required],
      holidays: this.fb.array([])
    });

    this.addHolidayRow();
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

  removeHolidayRow(index: number) {
    this.holidays.removeAt(index);
  }

  
  submit() {
    
    const formValue = this.holidayForm.value;

    const payload = {
      locationId: formValue.location?.id,
      subLocationId: formValue.subLocation,
      applicableyear: formValue.year?.value,
      addedby: parseInt(this.empinfo.employeeId),
      addedDate: new Date().toISOString(),
      status: 'Published',
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
        console.log(response);
        localStorage.setItem('personaldata', JSON.stringify(response))
        this.confirmation.openSuccessModal('Holidays added successfully');
        
        
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Holidays added failed');
        
      }
    });
    console.log(payload);
    
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

          console.log('Grouped Dropdown:', this.groupedLocationData);
        }
      });
    }
  });
  
  }

  

  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http
        .getData(
          `JobLocation/sub-location-by-joblocation/${selectedLocation.id}`
        )
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
            }
  
            console.log(this.subLocationsDropdown);
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
      const locationId = formValue.location?.id
      const subLocationId = selectedSubLocation

      console.log('Location ID:', locationId);
      console.log('Sub Location ID:', subLocationId);

      this.subscription = this.http
        .getData(
          `orgShifts/getshiftlocation?locationId=${locationId}&subLocationId=${subLocationId}`
        )
        .subscribe({
          next: (data: any) => {
            console.log('Shift Data:', data);

            if (data.length === 0) {
              this.shiftDropdown = []; // Reset if no shifts are found
            } else {
              this.shiftDropdown = [].concat(
                ...data.map((element: any) => element.orgShiftsItems)
              ); // Flatten the shift data
            }

            console.log('Shift Dropdown Values:', this.shiftDropdown);
          },
          error: (err: any) => {
            console.error('Error fetching shift data:', err);
            this.shiftDropdown = []; // Reset on error
          },
        });
    } else {
      this.shiftDropdown = []; // Reset if no sub-location is selected
    }
  }
  nagvition(){
    this.router.navigate(['/settings/employee-fields/manage-holidays/pending-for-submit']);
  }

  ngOnDestroy(){
    
  }
}
