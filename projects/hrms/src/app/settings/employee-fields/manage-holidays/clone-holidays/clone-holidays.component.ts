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
  selector: 'app-clone-holidays',
  imports: [CommonModule,Select,ReactiveFormsModule,TranslateModule],
  templateUrl: './clone-holidays.component.html',
  styleUrl: './clone-holidays.component.scss'
})
export class CloneHolidaysComponent {
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


  constructor(private fb: FormBuilder,public router:Router,private http: HttpService, private confirmation: OpenModalService,private modalService: NgbModal) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateHolidaysData = JSON.parse(localStorage.getItem('updateholidays') ?? '{}');

    this.getjobLocationList();

    
    
    this.holidayForm = this.fb.group({
      year: ['',Validators.required],
      location: ['',Validators.required],
      subLocation: ['',Validators.required],
      shift : ['',Validators.required],
      holidays: this.fb.array([])
    });
    

    this.holidayForm.patchValue({
      year: this.yearDetails.find((x:any) => x.value === this.updateHolidaysData.applicableyear),
    });
    this.updateHolidaysData.orgHolidaysItems.forEach((row:any) => {
      this.holidays.push(
        this.fb.group({
          holidayName : row.holidayName,
          holidayDate : moment(row.holidayDate).format('YYYY-MM-DD'),
          isOptional  : row.isOptional
        })
      );
    });
  
    console.log(this.updateHolidaysData);
  }



  get holidays(): FormArray {
    return this.holidayForm.get('holidays') as FormArray;
  }

  
  addHolidayRow() {
    const holidayGroup = this.fb.group({
      holidayName: ['',Validators.required],
      holidayDate: ['',Validators.required],
      isOptional: [false]
    });
    this.holidays.push(holidayGroup);
  }

  removeHolidayRow(index: number): void {
    if (this.holidays.length > 1) {
      this.holidays.removeAt(index);
    }
  }
  

  hidePublishCloneButtons : boolean = false
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
      authorizedstatus: 'string' ,
      shiftID: formValue.shift.id ?? this.updateHolidaysData.shiftID,
      id : this.updateHolidaysData.id,
      orgHolidaysItems: formValue.holidays.map((item: any) => ({
        holidayName: item.holidayName,
        holidayDate: item.holidayDate,
        isOptional: item.isOptional,
        status: 'Published',
        holidayColor: 'string',
        headerID : this.updateHolidaysData?.orgHolidaysItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgHolidays/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Holidays updated successfully');
        this.nagvition();
        
        
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Holidays update failed');
        
      }
    });
    console.log(payload);
    
  }
  
  cancel(){
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
      authorizedstatus: 'string' ,
      shiftID: formValue.shift.id ?? this.updateHolidaysData.shiftID,
      id : this.updateHolidaysData.id,
      orgHolidaysItems: formValue.holidays.map((item: any) => ({
        holidayName: item.holidayName,
        holidayDate: item.holidayDate,
        isOptional: item.isOptional,
        status: 'Published',
        holidayColor: 'string',
        headerID : this.updateHolidaysData?.orgHolidaysItems?.[0]?.headerID,
      }))
    };
    this.subscription = this.http.postdata('orgHolidays/Update', payload).subscribe({
      next: (response: any) => {
        console.log(response);
        this.confirmation.openSuccessModal('Holidays published successfully');
        
        
      },
      error: (err) => {
        console.log(err);
        this.confirmation.openErrorModal('Holidays published failed');
        
      }
    });
    console.log(payload);
    
  }

  getjobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (locations: any) => {
        this.jobLocationDropDownData = locations;
        console.log(this.jobLocationDropDownData);
        this.holidayForm.patchValue({
       //   location : this.jobLocationDropDownData.find((x:any) => x.jobLocationName === this.updateHolidaysData.locationName),
          location : this.jobLocationDropDownData.jobLocationName
        });
      //  this.getSubLocationByid(this.updateHolidaysData.locationId)
        this.getSubLocationByid(this.updateHolidaysData.locationId)
      }
    });

  }

  

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
              this.subLocationsDropdown = [];
            } else {
              this.subLocationsDropdown = data.jobSubLocations; 
              this. shiftDropdown = []; 
             
            }

            console.log(this.subLocationsDropdown);
           // this.holidayForm.patchValue({
             // subLocation : this.subLocationsDropdown.find((x:any) => x.jobSubLocationName === this.updateHolidaysData.subLocationName),
            //  subLocation : this.subLocationsDropdown,
          //  });

            // const shiftdata  = {
            //   locid : this.updateHolidaysData.locationId,
            //   sublocid : this.updateHolidaysData.subLocationId
            // }
            // this.getShiftBYid(shiftdata);
          },
          error: (err: any) => {

          },
        });
    } else {
      this.subLocationsDropdown = [];
      this.shiftDropdown = [];

    }
  }
  shiftDropdown: any[] = []; 

  getShiftBYid(selectedSubLocation: any): void {
    const formValue = this.holidayForm.value;
    if (selectedSubLocation && selectedSubLocation) {
      const locationId =  formValue.location?.id
      // const subLocationId = this.updateHolidaysData.subLocationId ?? selectedSubLocation
      const subLocationId = formValue.subLocation.id ?? selectedSubLocation
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
            
            // this.holidayForm.patchValue({
            //   shift : this.shiftDropdown.find((x:any) => x.id === this.updateHolidaysData.shiftID),
            // });
            // console.log('Shift Dropdown Values:', this.shiftDropdown);
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
