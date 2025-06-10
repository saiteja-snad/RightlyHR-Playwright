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
  selector: 'app-update-shift',
  imports: [RouterModule, Select, ReactiveFormsModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './update-shift.component.html',
  styleUrl: './update-shift.component.scss'
})
export class UpdateShiftComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('deleterowpopup') deleterowpopup: any;
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
  updategetdata: any;
  isDuplicateCodeName: boolean[] = [];
  isDuplicateCodeName1: boolean[] = [];
  Status: any;
  hoildaylist: any;
  sublocatiodis = false;
  disableupdate = true;
  initialPoliciesState: any;
  constructor(
    private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private http: HttpService,
    private conformationPopup: OpenModalService, private modalService: NgbModal) { }
    
ngOnInit(): void {
  this.initializeForm();
  this.yearsList();
  this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
  const shiftId = this.route.snapshot.paramMap.get('id');
  if (shiftId) {
    this.geAllLocations(shiftId); // Pass ID to be handled after locations are ready
  } else {
    this.geAllLocations(); // No shift to patch, just load locations
  }

 this.shiftForm.valueChanges.subscribe(() => {
    const currentState = JSON.stringify(this.shiftForm.getRawValue());
    this.hideBUTTON = currentState === this.initialPoliciesState ? false : true;
  });
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

  isDeleteDisabled: boolean = false;
  deleteShift(index: number) {
    if (this.shifts.length > 1) {
      this.shifts.removeAt(index);
      this.isDeleteDisabled = false; // allow delete if more than 1
    } else {
      this.isDeleteDisabled = true; // disable delete button
    }
  }

  onDeleterow(index: any) {
    if (this.shifts.length > 1) {
      this.shifts.removeAt(index);
      index.dismiss();
      this.isDeleteDisabled = false;
    } else {
      this.isDeleteDisabled = true;
    }
  }

  initializeForm() {
    this.shiftForm = this.fb.group({
      year: [null, Validators.required],
      location: [null, Validators.required],
      subLocation: [null, Validators.required],
      id: [this.route.snapshot.paramMap.get('id')],
      shifts: this.fb.array([this.createShift()])
    });
  }

  addShift(): void {
    if (this.shifts.length < 3) {
      this.shifts.push(this.createShift());
      this.hideBUTTON = true;
    } else {
      // Optional: show a message to the user
      // this.toastr.warning('You can only add up to 3 shifts.');
    }
  }

  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  createShift(shiftData: any = null): FormGroup {
    return this.fb.group({
      id: this.route.snapshot.paramMap.get('id'),
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
        location: data.locationId,
        id: data.id,
      });

      this.updategetdata = data;
      this.shiftDATA = data.subLocationId;
      this.selectedLocationId = data.locationId;

      const shiftArray = this.shiftForm.get('shifts') as FormArray;
      shiftArray.clear();
      data.orgShiftsItems.forEach((item: any) => {
        shiftArray.push(this.fb.group({
          shiftCode: [item.code, Validators.required],
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

      // ✅ Wait for locations to be ready and then patch subLocation
      const selectedLocation = this.locations.find(loc => loc.id === this.selectedLocationId);
      if (selectedLocation) {
        this.subLocations = selectedLocation.subLocations || [];
        const matchedSub = this.subLocations.find(sub => sub.id === this.shiftDATA);
        if (matchedSub) {
          this.shiftForm.patchValue({ subLocation: matchedSub.id });
        } else {
          this.disableupdate = false;
        }
      }
        this.initialPoliciesState = JSON.stringify(this.shiftForm.getRawValue());
        this.hideBUTTON = false;
    },
    error: (err: any) => console.error('Error loading shift data', err)
  });
}
  // end get shift by id
 
  updateshift(f: FormGroup) {
    if (this.shiftForm.valid) {
      const formValue = this.shiftForm.value;
      const payload = {
        id: this.route.snapshot.paramMap.get('id'),
        locationId: formValue.location,
        subLocationId: formValue.subLocation,
        applicableyear: formValue.year,
        status: "Pending for Submission",
        addedby: this.Employeeinfo.employeeId,
        addedDate: new Date(),
        lastModifeddate: new Date(),
        orgShiftsItems: formValue.shifts.map((shift: any, index: any) => ({
          shiftName: shift.shiftName,
          id: shift.id,
          headerID: this.route.snapshot.paramMap.get('id'),
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
      this.http.postdata(`orgShifts/Update/Shift/OrgShift`, payload).subscribe({
        next: (data: any) => {
          if (data.statusCode === 400) {
            alert('Error: Shift already exists.');
          } else {
            this.hoildaylist = data;
            this.conformationPopup.openSuccessModal('Shift Updated successfully');
            this.nagvition();
          }
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

  //shiftname duplicate
  isDuplicateShift(index: number): boolean {
    const shiftArray = this.shiftForm.get('shifts') as FormArray;
    const currentShift = shiftArray.at(index).value;
    return shiftArray.controls.some((ctrl, i) => {
      if (i === index) return false;
      const shift = ctrl.value;
      return (
        shift.shiftCode?.trim().toLowerCase() === currentShift.shiftCode?.trim().toLowerCase()
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

  Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  // clone button click
  cloneshiftsPolicy1(id: any): void {
    this.router.navigate(['/settings/employee-fields/cloneshifts', this.route.snapshot.paramMap.get('id')]);
  }

  publish() {
    this.initialPoliciesState = JSON.stringify(this.shifts.getRawValue());
    this.hideBUTTON = false;
    let publishItem = {
      Category: 'shifts',
      refentityId: this.shiftForm.value.shifts[0].headerID
    }
    this.subscription = this.http.postdata(`CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`, { params: publishItem }).subscribe({
      next: (respnose: any) => {
        this.conformationPopup.openSuccessModal('Shift Published successfully');
        setTimeout(() => {
          this.nagvition();
        }, 2000);
      },
      error: (error: any) => {
        // Handle error if needed
        console.error(error);
        if (error.error) {
          this.conformationPopup.openErrorModal(error.error.Message);
        }
      },
    })
  }
  
  // location change

// onLocationChange(selectedLocationId: number | null) {
//   const subLocationControl = this.shiftForm.get('subLocation');
//   // Always clear and mark subLocation as touched and dirty when location changes
//   this.subLocations = [];
//   subLocationControl?.markAsTouched();
//   subLocationControl?.markAsDirty();
//  subLocationControl?.disable();
//   this.sublocatiodis = false; // disable update button when location changes
//   if (selectedLocationId) {
//     // Find selected location and assign subLocations
//     const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
//     this.subLocations = selectedLocation?.subLocations || [];
//     if (this.subLocations.length > 0) {
//       subLocationControl?.enable();
//     } else if (this.subLocations.length === 0) {
//       subLocationControl?.disable(); // disable if no sublocations
//       this.shiftForm.patchValue({ subLocation: null });
//       this.disableupdate = false; // clear subLocation value
//     } else {
//       subLocationControl?.disable(); // disable if no sublocations
//     }
//   } else {
//     this.subLocations = [];
//     subLocationControl?.disable();
//   }
// }

onLocationChange(selectedLocationId: number | null) {
  const subLocationControl = this.shiftForm.get('subLocation');
  
  this.subLocations = [];
  subLocationControl?.markAsTouched();
  subLocationControl?.markAsDirty();
  subLocationControl?.setValue(null); // Clear previous value
  subLocationControl?.disable();      // Disable by default

  this.sublocatiodis = false; // disable update button

  if (selectedLocationId) {
    const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
    this.subLocations = selectedLocation?.subLocations || [];

    if (this.subLocations.length > 0) {
      subLocationControl?.enable();
    } else {
      subLocationControl?.disable();
      this.disableupdate = false;
    }
    // Force immediate validation and show error if subLocation is required
    subLocationControl?.updateValueAndValidity();
  } else {
    subLocationControl?.disable();
  }
}

  sublocation:any;
  geAllLocations(shiftId?: string) {
  this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
    next: (data: any) => {
      this.locations = data;
      this.sublocatiodis = true;

      if (shiftId) {
        // Only call getShiftById once locations are ready
        this.getShiftById(shiftId);
      }
    },
    error: (reason: any) => console.log(reason)
  });
}

onSubLocationChange(subLocationId: any) {
    const subLocationControl = this.shiftForm.get('subLocation');
    if (subLocationControl?.value) {
      this.disableupdate = true; 
    } else {
      this.disableupdate = false; 
    }
}
  // cancel button click
  onDelete(modal: any) {
    modal.dismiss();
    this.nagvition();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}