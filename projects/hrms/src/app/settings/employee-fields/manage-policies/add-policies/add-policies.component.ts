import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { Select } from 'primeng/select';
import { IPolicies } from '../../../../Interfaces/policies.model';
import { Subject, takeUntil } from 'rxjs';
import { ILocation, IShiftHeader, ISubLocation } from '../../../time-off/flexible-leave-allocation/leave-allocation.model';

@Component({
  selector: 'app-add-policies',
  imports: [Select,CommonModule,FormsModule,
    ReactiveFormsModule],
  templateUrl: './add-policies.component.html',
  styleUrl: './add-policies.component.scss'
})
export class AddPoliciesComponent {
  policyform!: FormGroup;
  yearsList: number[] = [];
  locationDetails!: ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  orgHolidayItemsArrayTrue:any = [];
  orgHolidayItemsArrayFalse:any =[];
  empinfo: any;
  subscription: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  http: any;
  jobshiftdetails: any;
  length: number = 0;
  optional:number = 0;
  selectedfileds = {} as any;
  sharedModalService: any;
  fb: any;
  constructor( public router:Router) { }
  ngOnInit(): void {
    this.policyform = new FormGroup({
      selectedYear: new FormControl(this.selectedYear)
    });
    
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      console.log(this.empinfo.employeeId);
      this.getjobDetails();
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    
  
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push({ name: i.toString(), value: i });
    }
    
  }
  // salaryHoldDetails = [
  //   { name: 'Yes', value: true },
  //   { name: 'No', value: false },
  // ]
  navigation(){
    this.router.navigate(['/settings/employee-fields/manage-policies/pending-for-submit']);
  }
  policiesdata = {} as IPolicies;
  years: { name: string, value: number }[] = [];

  currentYear: number = new Date().getFullYear();
  jobLocationDropDownData = {} as any;
  selectedYear: number = this.currentYear;
  getjobDetails() {
    let EmployeeId = this.empinfo.employeeId;
    console.log(EmployeeId);
    this.subscription = this.http.getData(`JobDetails/${EmployeeId}`).subscribe({
        next: (data: any) => {
            console.log(data);
            this.jobshiftdetails = data;
            console.log(this.jobshiftdetails);
            this.getPolicy(data);
        }
    });
  }
  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.policyform.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.policyform.get('subLocation')?.enable();
      this.policyform.get('subLocation')?.reset();
    }
  }
  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id,
    };

    this.http
      .getDataWithQueryParams(`orgShifts/getshiftlocation`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap(
            (header: any) => header.orgShiftsItems || []
          );
          this.policyform.get('shift')?.enable();
        },
        error: (err: any) => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.policyform.get('shift')?.reset();
          this.policyform.get('shift')?.disable();
        },
      });
  }
  get momentRows(): FormArray {
    return this.policyform.get('momentRows') as FormArray;
  }

  addMomentRow() {
    if (this.momentRows.length < 4) {
      this.momentRows.push(this.createMomentRow());
    } else {
    }
  }
  createMomentRow(): FormGroup {
    return this.fb.group({
      policyName: ['', Validators.required],
      policyAttachment: ['', Validators.required],
      description: [null, Validators.required],
    });
  }
  removeMomentRow(index: number) {
    this.momentRows.removeAt(index);
  }

  onYearChange() {
    this.selectedYear = this.policyform.get('selectedYear')?.value;
    this.getPolicy(this.jobshiftdetails);
  }
  getPolicy(jobshiftdetails: any) {
    this.orgHolidayItemsArrayTrue = [];
    this.orgHolidayItemsArrayFalse = [];
    // this.length = 0;
    // this.optional = 0;
  
    const selectedYearFromForm = this.policyform.get('selectedYear')?.value;
  
    let holiday = {
      locationId: jobshiftdetails[0].locationid,
      subLocationId: jobshiftdetails[0].sublocationid,
      shiftId: jobshiftdetails[0].shiftId,
      Applicableyear: selectedYearFromForm
    };
  
    console.log("Holiday Query:", holiday);
  
    // this.subscription = this.http.getDataWithQueryParams(`orgHolidays/getHolidaysbylocation`, holiday).subscribe({
    //   next: (response: any) => {
    //     this.Policies = response;
    //     console.log(this.Policies);
  
    //     this.orgHolidayItemsArray = response[0].orgHolidaysItems;
    //     console.log(this.orgHolidayItemsArray);
  
    //     this.orgHolidayItemsArray.forEach(item => {
    //       if (item.isOptional) {
    //         this.orgHolidayItemsArrayTrue.push(item);
    //         this.length = this.orgHolidayItemsArrayTrue.length;
    //       } else {
    //         this.orgHolidayItemsArrayFalse.push(item);
    //         this.optional = this.orgHolidayItemsArrayFalse.length;
    //       }
    //     });
    //   },
    //   error: (reason: any) => console.log(reason)
    // });
  }
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  onClick(data: any) {
    console.log(data);

    this.selectedfileds = JSON.parse(JSON.stringify(data))
    this.selectedfileds.validupto = this.formatDate(this.selectedfileds.validupto)
  }
  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.jobLocationDropDownData = data.jobLocations
      }
    })
  }
  navigate() {
    this.router.navigate(['/settings/employee-fields/manage-dsts']);
  }
   onSubmit(policyform: FormGroup) {
      if (policyform.invalid) {
        this.policyform.markAllAsTouched();
        return;
      }
  
      const formValue = this.policyform.value;
  
      const policydata = {
        lastModifiedDate: new Date(),
        addedDate: new Date(),
        status: 'Pending for submission',
        addedBy: this.empinfo.employeeId,
        lastModifiedBy: this.empinfo.employeeId,
        applicableYear: formValue.year,
        sublocationId: formValue.subLocation.id,
        shiftId: formValue.shift.id,
        locationId: formValue.location.id,
        dayLight: formValue.momentRows.map((row: any) => ({
          startDate: row.startDate,
          endDate: row.endDate,
          momentType: row.momentType,
          duration: row.duration,
        })),
      };
      this.http
        .postdata('orgPolicies/Post', policydata)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.sharedModalService.openSuccessModal(
              'Manage DST added Successfully'
            );
            this.navigate();
          },
          error: (err: any) => {
            this.sharedModalService.openErrorModal(
              'Shift already exists with the year , location and sub location'
            );
          },
          complete: () => {},
        });
    }
  

  OnClickLocation() {
    if (this.policiesdata.location) {
      console.log(this.policiesdata.location);

      let locationName = this.policiesdata.location
      console.log(locationName);
      let joblocationdetails = this.jobLocationDropDownData.find(
        (c: any) => c.jobLocationName === locationName
      );
      console.log(this.jobLocationDropDownData);
      console.log(joblocationdetails);
      this.getSubLocationByid(joblocationdetails)
    }
    else {
      console.log(this.selectedfileds.location);

      let locationName = this.selectedfileds.location
      console.log(locationName);
      let joblocationdetails = this.jobLocationDropDownData.find(
        (c: any) => c.jobLocationName === locationName
      );
      console.log(this.jobLocationDropDownData);
      console.log(joblocationdetails);
      this.getSubLocationByid(joblocationdetails)
    }

  }
  subLocationsDropdown = {} as any;
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations
        console.log(this.subLocationsDropdown);
      }
    })

  }
  
}
