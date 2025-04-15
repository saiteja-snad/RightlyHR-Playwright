import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-shits',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    TabsModule
  ],
  templateUrl: './add-shits.component.html',
  styleUrl: './add-shits.component.scss'
})
export class AddShitsComponent {
  shiftForm!: FormGroup;
  years: number[] = [];
  locations: any[] = [];
  subLocations: any[] = [];
  subscription!: Subscription;
  Employeeinfo = {} as any;
  currentYear: number = new Date().getFullYear();
  navTabs: any[] = [
    { label: 'Create Shifts', link: '/claimsandexpenses/addexpens' },

  ];

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
  }

  yearsList() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
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

  createShift(): FormGroup {
    return this.fb.group({
      shiftCode: ['', Validators.required],
      shiftName: ['', Validators.required],
      color: ['#00ff00'],
      startTime: ['00', Validators.required],
      endTime: ['00', Validators.required],
      gracePeriod: [15, Validators.required],
      latesAllowed: [3, Validators.required],
      breakTime: [1, Validators.required],
      halfDayMinHrs: [3, Validators.required],
      fullDayMinHrs: [6, Validators.required]
    });
  }

  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  addShift() {
    this.shifts.push(this.createShift());
  }

  deleteShift(index: number) {
    this.shifts.removeAt(index);
  }

  saveasDraft(): void {
    if (this.shiftForm.valid) {
      const formValue = this.shiftForm.value;

      const payload = {
        locationId: formValue.location,
        subLocationId: formValue.subLocation,
        applicableyear: formValue.year,
        status: "Pending for Submission",
        addedby: this.Employeeinfo.employeeId,
        addedDate: new Date(),
        orgShiftsItems: formValue.shifts.map((shift: any) => ({
          shiftName: shift.shiftName,
          shiftStartTime: shift.startTime + ':' + shift.endTime,
          shiftEndTime: shift.startTime + ':' + shift.endTime,
          shiftDescription: "hi",
          status: "Submitted",
          code: shift.shiftCode,
          color: shift.color,
          allowedGracePeriod: shift.gracePeriod,
          latesAllowed: shift.latesAllowed,
          allowedBreakTime: shift.breakTime,
          halfDayMinHrs: shift.halfDayMinHrs,
          fullDayMinHrs: shift.fullDayMinHrs,
        }))
      };
      
      this.http.postdata(`orgShifts/Post/Shift/OrgShift`, payload).subscribe({
        next: (data: any) => {
          this.nagvition()
        },
        error: (error: any) => {
          console.log("error" + error)
        }
      });
    }
  }

  geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
      },
      error: (reason: any) => console.log(reason)
    });
  }

  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.shiftForm.get('subLocation');
  
    // Reset subLocation value
    subLocationControl?.reset();
  
    if (selectedLocationId) {
      // Enable subLocation field
      subLocationControl?.enable();
  
      // Find the selected location object
      const selectedLocation = this.locations.find(
        loc => loc.id === selectedLocationId
      );
  
      // Extract subLocations
      this.subLocations = selectedLocation?.subLocations || [];
    } else {
      // Disable if location is invalid
      subLocationControl?.disable();
      this.subLocations = [];
    }
  }
  
  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}
