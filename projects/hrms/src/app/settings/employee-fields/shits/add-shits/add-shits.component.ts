import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-shits',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    TabsModule,TranslateModule
  ],
  templateUrl: './add-shits.component.html',
  styleUrl: './add-shits.component.scss'
})
export class AddShitsComponent {
  @ViewChild('deletepopup') deletepopup: any;
  shiftForm!: FormGroup;
  years: number[] = [];
  locations: any[] = [];
  subLocations: any[] = [];
  subscription!: Subscription;
  Employeeinfo = {} as any;
  currentYear: number = new Date().getFullYear();
  // navTabs: any[] = [
  //   { label: 'Create Shifts', link: '/claimsandexpenses/addexpens' },

  // ];
  isDuplicateCodeName: boolean[] = [];
  isDuplicateCodeName1: boolean[] = [];
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
     private conformationPopup: OpenModalService,
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
  preventMinus(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e') {
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
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      shifts: this.fb.array([this.createShift()])
    });
  }

  createShift(): FormGroup {
    return this.fb.group({
      shiftCode: ['', Validators.required],
      shiftName: ['', Validators.required],
      color: ['#FFFFFF'],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
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

 isDeleteDisabled: boolean = false;

deleteShift(index: number) {
  if (this.shifts.length > 1) {
    this.shifts.removeAt(index);
    this.isDeleteDisabled = false; // allow delete if more than 1
  } else {
    this.isDeleteDisabled = true; // disable delete button
  }
}

  Cancel(){
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
     
  }
  // submit button click
  Addshift(): void {
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
      // shiftStartTime: shift.startTime + ':' + shift.endTime,
          // shiftEndTime: shift.startTime + ':' + shift.endTime,
      this.http.postdata(`orgShifts/Post/Shift/OrgShift`, payload).subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Shift Added successfully');
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
// location changes
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
  //check for same shift code
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
  onDelete(modal:any){
    modal.dismiss();
this.nagvition();
  }
  closeDelete(modal:any){
    modal.dismiss();
  }
  nagvition() {
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}
