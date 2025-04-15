import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-update-shifts',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    TabsModule
  ],
  templateUrl: './update-shifts.component.html',
  styleUrl: './update-shifts.component.scss'
})
export class UpdateShiftsComponent {
  shiftForm!: FormGroup;
  years: { label: string; value: number }[] = [];
  locations: any[] = [];
  subLocations: any[] = [];
  subscription!: Subscription;
  Employeeinfo = {} as any;
  currentYear: number = new Date().getFullYear();
  shiftId!: number;
  shiftDATA:any;
  selectdata:any;
  selectedLocationId:any;
  matchedSubLocation:any;
  selectedLocation:any;
  navTabs: any[] = [
    { label: 'Update Shifts', link: '/claimsandexpenses/addexpens' },
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');

    const shiftId = this.route.snapshot.paramMap.get('id');
    if (shiftId) {
      this.getShiftById(shiftId);
    }
  }


  yearsList() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push({ label: i.toString(), value: i });
    }
  }

  initializeForm() {
    this.shiftForm = this.fb.group({
      year: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      shifts: this.fb.array([this.createShift()])
    });
  }


  addShift() {
    this.shifts.push(this.createShift());
  }
updateshift(f: FormGroup){
 // Create a new array with the properties from this.selectedshift.orgShiftsItems
//  let updatedShift = {
//   id: this.selectedshift.id,
//   locationId: this.selectedshift.locationId,
//   subLocationId: this.selectedshift.subLocationId,
//   applicableyear: this.selectedshift.applicableyear,
//   status: "Pending for Submission",
//   addedby: this.Employeeinfo.employeeId,
//   addedDate: this.selectedshift.addedDate,
//   lastModifeddate:new Date(),
  
//   orgShiftsItems: this.selectedshift.orgShiftsItems.map((row: any) => ({

//     shiftName: row.shiftName,
//     id: row.id,
//     headerID: this.selectedshift.id,
//     shiftStartTime: row.shiftStartTime1 + ':' + row.shiftEndTime1,
//     shiftEndTime: row.shiftStartTime2 + ':' + row.shiftEndTime2,
//     shiftDescription: "hi",
//     status: "Pending for Submission",
//     code: row.code,
//     color: row.color,
//     allowedGracePeriod: row.allowedGracePeriod,
//     latesAllowed: row.latesAllowed,
//     allowedBreakTime: row.allowedBreakTime,
//     halfDayMinHrs: row.halfDayMinHrs,
//     fullDayMinHrs: row.fullDayMinHrs,
//   }))
// }

}
  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  createShift(shiftData: any = null): FormGroup {
    return this.fb.group({
      shiftCode: [shiftData?.code || '', Validators.required],
      shiftName: [shiftData?.shiftName || '', Validators.required],
      color: [shiftData?.color || '#00ff00'],
      startTime: [shiftData?.shiftStartTime?.split(':')[0] || '', Validators.required],
      endTime: [shiftData?.shiftStartTime?.split(':')[1] || '', Validators.required],
      gracePeriod: [shiftData?.allowedGracePeriod ||'', Validators.required],
      latesAllowed: [shiftData?.latesAllowed || '', Validators.required],
      breakTime: [shiftData?.allowedBreakTime || '', Validators.required],
      halfDayMinHrs: [shiftData?.halfDayMinHrs || '', Validators.required],
      fullDayMinHrs: [shiftData?.fullDayMinHrs || '', Validators.required],
    });
  }

  getShiftById(id: string) {
    this.http.getData(`orgShifts/getbyid/${id}`).subscribe({
      next: (data: any) => {
        this.shiftForm.patchValue({
          year: data.applicableyear,
          location: data.locationId,
          subLocation: data.subLocationId,
        });
        this.shiftDATA = data.subLocationId;
        this.selectedLocationId = data.locationId;
        console.log("Selected Locationid:", this.selectedLocationId);
        console.log(this.shiftDATA);
       
         this.onLocationChange(data.locationId); // to load sublocations
        const shiftArray = this.shiftForm.get('shifts') as FormArray;
        shiftArray.clear(); // remove any existing default shift

        data.orgShiftsItems.forEach((item: any) => {
          shiftArray.push(this.fb.group({
            shiftCode: [item.code],
            shiftName: [item.shiftName],
            color: [item.color],
            startTime: [item.shiftStartTime],
            endTime: [item.shiftEndTime],
            gracePeriod: [item.allowedGracePeriod],
            latesAllowed: [item.latesAllowed],
            breakTime: [item.allowedBreakTime],
            halfDayMinHrs: [item.halfDayMinHrs],
            fullDayMinHrs: [item.fullDayMinHrs],
          }));
        });
      },
      // startTime: [item.shiftStartTime.split(':')[0]],
      //       endTime: [item.shiftEndTime.split(':')[1]],
      error: (err: any) => console.error('Error loading shift data', err)
    });
  }


  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.shiftForm.get('subLocation');
    // subLocationControl?.reset();

    if (selectedLocationId) {
      subLocationControl?.enable();
      const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
      this.subLocations = selectedLocation?.subLocations||[];
      this.selectdata = this.subLocations.find(loc => loc.id === this.shiftDATA);
      if (this.selectdata) {
        subLocationControl?.setValue(this.selectdata.id); // ensure `optionValue="id"` is used in p-select
      }
      console.log(this.subLocations);
      console.log(this.selectdata);
    } else {
      subLocationControl?.disable();
      this.subLocations = [];
    }
  }
 
  sublocation:any;
  geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
        this.selectedLocation = this.locations.find(loc => loc.id === this.selectedLocationId);
        console.log(this.selectedLocation);
        console.log("Selected Location:", this.selectedLocation);
        this.sublocation = this.selectedLocation.subLocations;
        // console.log("Selected sublocation:", sublocation);
        const sublocationdata = this.sublocation.find(
          (sub: any) => sub.id === this.shiftDATA
        );
        
        if (sublocationdata) {
          console.log("Matched Sub Location ID:", sublocationdata.id);
          console.log("Selected Sub Location Name:", sublocationdata.jobSubLocationName);
            this.matchedSubLocation = sublocationdata;
            if (this.matchedSubLocation) {
             // Set the value to form
              this.shiftForm.patchValue({ subLocation: this.matchedSubLocation.id });
      
              // Optionally store matched name for display/logging
              this.matchedSubLocation = this.matchedSubLocation.jobSubLocationName;
            }
          }
      },
      error: (reason: any) => console.log(reason)
     });
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/shits/published-shits']);
  }
}
