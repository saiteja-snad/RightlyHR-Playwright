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
import { OpenModalService } from '../../../../services/open-modal.service';

@Component({
  selector: 'app-clone-shift',
  imports: [RouterModule, Select, ReactiveFormsModule, CommonModule,
    TabsModule, TranslateModule, TranslateModule],
  templateUrl: './clone-shift.component.html',
  styleUrl: './clone-shift.component.scss'
})
export class CloneShiftComponent {
  @ViewChild('deletepopup') deletepopup: any;
  shiftForm!: FormGroup;
  years: { label: string; value: number }[] = [];
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
  Status: any;
  hoildaylist: any;
  sublocatiodis = false;
  isDuplicateCodeName: boolean[] = [];
  isDuplicateCodeName1: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    const shiftId = this.route.snapshot.paramMap.get('id');
    const clonedShiftData = localStorage.getItem('clonedShiftData');
   if (shiftId && clonedShiftData) {
    const parsedData = JSON.parse(clonedShiftData);
    this.patchShiftForm(parsedData); // patch form using the same method
  }
  }

  patchShiftForm(data: any): void {
  this.shiftForm.patchValue({
    year: data.year,
    location: '',
    id: '',
    subLocation: ''
  });

  const shiftArray = this.shiftForm.get('shifts') as FormArray;
  shiftArray.clear();
  (data.shifts || []).forEach((item: any) => {
    shiftArray.push(this.fb.group({
      shiftCode: [item.shiftCode || '', Validators.required],
      shiftName: [item.shiftName || '', Validators.required],
      color: [item.color || '#000000'],
      startTime: [item.startTime || '', Validators.required],
      endTime: [item.endTime || '', Validators.required],
      gracePeriod: [item.gracePeriod || 0, Validators.required],
      latesAllowed: [item.latesAllowed || 0, Validators.required],
      breakTime: [item.breakTime || 0, Validators.required],
      halfDayMinHrs: [item.halfDayMinHrs || 0, Validators.required],
      fullDayMinHrs: [item.fullDayMinHrs || 0, Validators.required],
    }));
  });

}


  Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  yearsList() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push({ label: i.toString(), value: i });
    }
  }

  //BLOCK -VE VALUE
  blockInvalidKeys(event: KeyboardEvent) {
    const invalidKeys = ['-', '+', 'e', 'E'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  blockNegativePaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text');
    if (clipboardData && parseFloat(clipboardData) < 0) {
      event.preventDefault();
    }
  }

  initializeForm() {
    this.shiftForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: [null, Validators.required],
      subLocation: [null, Validators.required],
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
      color: [shiftData?.color || '#FFFFFF'],
      startTime: [shiftData?.shiftStartTime?.split(':')[0] || '', Validators.required],
      endTime: [shiftData?.shiftStartTime?.split(':')[1] || '', Validators.required],
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
          location: '',
          subLocation: '',
          id: data.id,
        });
        this.shiftDATA = '';
        this.selectedLocationId = data.locationId;
      //  this.onLocationChange(data.locationId); // to load sublocations
        const shiftArray = this.shiftForm.get('shifts') as FormArray;
        shiftArray.clear(); // remove any existing default shift
        data.orgShiftsItems.forEach((item: any) => {
          shiftArray.push(this.fb.group({
            shiftCode: ['', Validators.required],
            shiftName: [item.shiftName, Validators.required],
            color: [item.color],
            id: [item.id],
            headerID: [data.id],
            startTime: [item.shiftStartTime, Validators.required],
            endTime: [item.shiftEndTime, Validators.required],
            gracePeriod: [item.allowedGracePeriod, Validators.required],
            latesAllowed: [item.latesAllowed, Validators.required],
            breakTime: [item.allowedBreakTime, Validators.required],
            halfDayMinHrs: [item.halfDayMinHrs, Validators.required],
            fullDayMinHrs: [item.fullDayMinHrs, Validators.required],
          }));
        });
      },
      error: (err: any) => console.error('Error loading shift data', err)
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

  // submit button click
  Addshift(): void {
    if (this.shiftForm.valid && this.isAllShiftsValid) {
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
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
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
          this.conformationPopup.openSuccessModal('Shift Added successfully');
          this.nagvition()
        },
        error: (error: any) => {
          // Handle error if needed
          console.error(error);
          if (error.error) {
            this.conformationPopup.openErrorModal(error.error.Message);
          }
        },
      });
    }
  }

  get isAllShiftsValid(): boolean {
    const shiftArray = this.shiftForm.get('shifts') as FormArray;
    return shiftArray.controls.every(shift => shift.valid);
  }
  
  // check for duplicated shift code,name
  isDuplicateShift(index: number): boolean {
    const shiftArray = this.shiftForm.get('shifts') as FormArray;
    const currentShift = shiftArray.at(index).value;
    return shiftArray.controls.some((ctrl, i) => {
      if (i === index) return false;
      const shift = ctrl.value;
      return (
        shift.shiftCode?.trim().toLowerCase() === currentShift.shiftCode?.trim().toLowerCase()
        // shift.shiftName?.trim().toLowerCase() === currentShift.shiftName?.trim().toLowerCase()
      );
    });
  }

  isDuplicateShift1(index: number): boolean {
    const shiftArray = this.shiftForm.get('shifts') as FormArray;
    const currentShift = shiftArray.at(index).value;
    return shiftArray.controls.some((ctrl, i) => {
      if (i === index) return false;
      const shift = ctrl.value;
      return (
        // shift.shiftCode?.trim().toLowerCase() === currentShift.shiftCode?.trim().toLowerCase() &&
        shift.shiftName?.trim().toLowerCase() === currentShift.shiftName?.trim().toLowerCase()
      );
    });
  }

  checkDuplicate(index: number): void {
    this.isDuplicateCodeName[index] = this.isDuplicateShift(index);
  }

  checkDuplicate1(index: number): void {
    this.isDuplicateCodeName1[index] = this.isDuplicateShift1(index);
  }

  // cancel button click
  onDelete(modal: any) {
    modal.dismiss();
    this.nagvition();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  // location changes
onLocationChange(selectedLocationId: number | null) {
  const subLocationControl = this.shiftForm.get('subLocation');
  subLocationControl?.markAsTouched();
  subLocationControl?.markAsDirty(); // Add this line

  if (selectedLocationId) {
    subLocationControl?.enable();
    const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
    this.subLocations = selectedLocation?.subLocations || [];

    this.selectdata = this.subLocations.find(loc => loc.id === this.selectedLocationId);
    if (this.selectdata) {
      subLocationControl?.setValue(this.selectdata.id);
    } else {
      subLocationControl?.setValue(null); // Reset if no default found
    }

  } else {
    subLocationControl?.disable();
    subLocationControl?.setValue(null); // Clear value
    this.subLocations = [];
  }
}
  // sublocation
  sublocation: any;
  geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
        this.sublocatiodis = true;
        this.selectedLocation = this.locations.find(loc => loc.id === this.selectedLocationId);
        this.subLocations = this.selectedLocation.subLocations;
        const sublocationdata = this.subLocations.find(
          (sub: any) => sub.id === this.shiftDATA
        );
        if (sublocationdata) {
          this.matchedSubLocation = sublocationdata;
          if (this.matchedSubLocation) {           
            this.shiftForm.patchValue({ subLocation: this.matchedSubLocation.id });
            this.matchedSubLocation = this.matchedSubLocation.jobSubLocationName;
                   
          }
            
          
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}
