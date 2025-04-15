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

  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  createShift(shiftData: any = null): FormGroup {
    return this.fb.group({
      shiftCode: [shiftData?.code || '', Validators.required],
      shiftName: [shiftData?.shiftName || '', Validators.required],
      color: [shiftData?.color || '#00ff00'],
      startTime: [shiftData?.shiftStartTime?.split(':')[0] || '00', Validators.required],
      endTime: [shiftData?.shiftStartTime?.split(':')[1] || '00', Validators.required],
      gracePeriod: [shiftData?.allowedGracePeriod || 15, Validators.required],
      latesAllowed: [shiftData?.latesAllowed || 3, Validators.required],
      breakTime: [shiftData?.allowedBreakTime || 1, Validators.required],
      halfDayMinHrs: [shiftData?.halfDayMinHrs || 3, Validators.required],
      fullDayMinHrs: [shiftData?.fullDayMinHrs || 6, Validators.required],
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

        this.onLocationChange(data.locationId); // to load sublocations

        const shiftArray = this.shiftForm.get('shifts') as FormArray;
        shiftArray.clear(); // remove any existing default shift

        data.orgShiftsItems.forEach((item: any) => {
          shiftArray.push(this.fb.group({
            shiftCode: [item.code],
            shiftName: [item.shiftName],
            color: [item.color],
            startTime: [item.shiftStartTime.split(':')[0]],
            endTime: [item.shiftEndTime.split(':')[1]],
            gracePeriod: [item.allowedGracePeriod],
            latesAllowed: [item.latesAllowed],
            breakTime: [item.allowedBreakTime],
            halfDayMinHrs: [item.halfDayMinHrs],
            fullDayMinHrs: [item.fullDayMinHrs],
          }));
        });
      },
      error: (err: any) => console.error('Error loading shift data', err)
    });
  }


  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.shiftForm.get('subLocation');
    subLocationControl?.reset();

    if (selectedLocationId) {
      subLocationControl?.enable();
      const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
      this.subLocations = selectedLocation?.subLocations || [];
    } else {
      subLocationControl?.disable();
      this.subLocations = [];
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

  nagvition() {
    this.router.navigate(['/settings/employee-fields/shits/published-shits']);
  }
}
