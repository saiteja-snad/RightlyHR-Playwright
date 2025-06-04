import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
@Component({
  selector: 'app-view-shift',
  imports: [RouterModule, Select, ReactiveFormsModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './view-shift.component.html',
  styleUrl: './view-shift.component.scss'
})

export class ViewShiftComponent {
  @ViewChild('deletepopup') deletepopup: any;
  shiftForm!: FormGroup;
  years: { label: string; value: number }[] = [];
  id: any;
  locations: any[] = [];
  subLocations: any[] = [];
  subscription!: Subscription;
  Employeeinfo = {} as any;
  currentYear: number = new Date().getFullYear();
  shiftId!: number;
  shiftDATA: any;
  selectdata: any;
  selectedLocationId: any;
  matchedSubLocation: any;
  selectedLocation: any;
  shiftid: any;
  hideBUTTON = false;
  isDisabled = true;
  disabled: boolean | undefined;

  constructor( private route: ActivatedRoute, private fb: FormBuilder, private router: Router,
     private http: HttpService, private modalService: NgbModal) { }

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

patchShiftForm(data: any): void {
  this.shiftForm.patchValue({
    year: data.year,
    location: data.location,
  });

  const selectedLocation = this.locations.find(loc => loc.id === data.location);
  console.log(selectedLocation)
  if (selectedLocation) {
    this.subLocations = selectedLocation.subLocations || [];

    const matchedSub = this.subLocations.find(sub => sub.id === data.subLocation);
    console.log(matchedSub.id)
    if (matchedSub) {
      this.shiftForm.patchValue({ subLocation: matchedSub.id });
    }
  }

  const shiftArray = this.shiftForm.get('shifts') as FormArray;
  shiftArray.clear();

  (data.shifts || []).forEach((item: any) => {
    const shiftGroup = this.fb.group({
      shiftCode: [{ value: item.shiftCode || '', disabled: true }, Validators.required],
      shiftName: [{ value: item.shiftName || '', disabled: true }, Validators.required],
      color: [{ value: item.color || '#000000', disabled: true }],
      startTime: [{ value: item.startTime || '', disabled: true }, Validators.required],
      endTime: [{ value: item.endTime || '', disabled: true }, Validators.required],
      gracePeriod: [{ value: item.gracePeriod || 0, disabled: true }],
      latesAllowed: [{ value: item.latesAllowed || 0, disabled: true }],
      breakTime: [{ value: item.breakTime || 0, disabled: true }],
      halfDayMinHrs: [{ value: item.halfDayMinHrs || 0, disabled: true }],
      fullDayMinHrs: [{ value: item.fullDayMinHrs || 0, disabled: true }],
    });

    shiftArray.push(shiftGroup);
  });

  // Disable top-level controls
  this.shiftForm.get('year')?.disable();
  this.shiftForm.get('location')?.disable();
  this.shiftForm.get('subLocation')?.disable();
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
      id: [this.route.snapshot.paramMap.get('id')],
      shifts: this.fb.array([this.createShift()])
    });
  }

  isDeleteDisabled: boolean = false;
  deleteShift(index: number) {
    if (this.shifts.length > 1) {
      this.shifts.removeAt(index);
      this.isDeleteDisabled = false; // allow delete if more than 1
    } else {
      this.isDeleteDisabled = true; // disable delete button
    }
  }

  addShift() {
    this.shifts.push(this.createShift());
    this.hideBUTTON = true;
  }

  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  createShift(shiftData: any = null): FormGroup {
    return this.fb.group({
      id: this.route.snapshot.paramMap.get('id'),
      shiftCode: [shiftData?.code || '', Validators.required],
      shiftName: [shiftData?.shiftName || '', Validators.required],
      color: [shiftData?.color || '#00ff00'],
      startTime: [shiftData?.shiftStartTime?.split(':')[0] || '', Validators.required],
      endTime: [shiftData?.shiftStartTime?.split(':')[1] || '', Validators.required],
      gracePeriod: [shiftData?.allowedGracePeriod || '', Validators.required],
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
          id: data.id,
        });
        this.shiftDATA = data.subLocationId;
        this.selectedLocationId = data.locationId;
        this.onLocationChange(data.locationId); // to load sublocations
        const shiftArray = this.shiftForm.get('shifts') as FormArray;
        shiftArray.clear(); // remove any existing default shift
        data.orgShiftsItems.forEach((item: any) => {
          shiftArray.push(this.fb.group({
            shiftCode: [item.code],
            shiftName: [item.shiftName],
            color: [item.color],
            id: [item.id],
            headerID: [data.id],
            startTime: [item.shiftStartTime],
            endTime: [item.shiftEndTime],
            gracePeriod: [item.allowedGracePeriod],
            latesAllowed: [item.latesAllowed],
            breakTime: [item.allowedBreakTime],
            halfDayMinHrs: [item.halfDayMinHrs],
            fullDayMinHrs: [item.fullDayMinHrs],
          }));
        });
        this.shiftid = data.orgShiftsItems.forEach((items: any) => {
          console.log('this.shiftid ', items.id);
        });
      },
      error: (err: any) => console.error('Error loading shift data', err)
    });
  }

  Status: any;
  hoildaylist: any;
  Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  cloneshiftsPolicy1(id: any): void {
    this.router.navigate(['/settings/employee-fields/cloneshifts', this.route.snapshot.paramMap.get('id')]);
  }

  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.shiftForm.get('subLocation');
    if (selectedLocationId) {
      subLocationControl?.enable();
      const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
      this.subLocations = selectedLocation?.subLocations || [];
      this.selectdata = this.subLocations.find(loc => loc.id === this.shiftDATA);
      if (this.selectdata) {
        subLocationControl?.setValue(this.selectdata.id);
      }
    } else {
      subLocationControl?.disable();
      this.subLocations = [];
    }
  }

  sublocation: any;
  geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
      const selectedShiftData = JSON.parse(localStorage.getItem('viewShiftData')!);
      if (selectedShiftData) {
        this.patchShiftForm(selectedShiftData);
      }
      },
      error: (reason: any) => console.log(reason)
    });
  }

  onDelete(modal: any) {
    modal.dismiss();
    this.nagvition();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-shifts/published-shifts']);
  }
}
