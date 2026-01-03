import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { Router } from '@angular/router';
import { Iorgcategoryleaves, ShiftData } from '../../../../Interfaces/timoff-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { ILetterType } from '../../../../Interfaces/leave-type.model';
@Component({
  selector: 'app-clone-leavecategory',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './clone-leavecategory.component.html',
  styleUrl: './clone-leavecategory.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class CloneLeavecategoryComponent implements OnInit, OnDestroy{
  leavePolicyForm!: FormGroup;
  subscription!: Subscription;
  years: { label: string; value: number }[] = [];
  jobLocationDropDownData: any[] = [];
  subLocationsDropdown: any[] = [];
  shiftDropdown: ShiftData[] = [];
  publishedCategories: any[] = [];
  postOrgPloicyDetailsArray: [] = [];
  leaveCategoryType: any[] = [
    { label: 'General', value: 1 },
    { label: 'Flexible', value: 0 }
  ];
  genderDetails: any[] = [
    { label: 'All', value: 0 },
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 },
  ];
  marriedDetails: any[] = [
    { label: 'All', value: 0 },
    { label: 'Married', value: 1 },
    { label: 'Unmarried', value: 2 },
  ];
  global: any[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  leaveTypeOptions = [
    { label: 'Fixed Number of Leaves', value: 'Fixed Number of Leaves' },
    { label: 'Monthly Incremental Leaves', value: 'Monthly Incremental Leaves' }
  ];

  shiftsArray = [] as any[];
  leaveTypes: ILetterType[] = [];
  updatecloneLeaveCategoryData = {} as Iorgcategoryleaves;


  constructor(private fb: FormBuilder, private http: HttpService, private confirmation: OpenModalService, private router: Router, private modalService: NgbModal) { }


  ngOnInit(): void {
    this.intializeForm();
    this.updatecloneLeaveCategoryData = JSON.parse(localStorage.getItem('cloneleavecategory') ?? '{}');
    this.setupDependentFieldListeners();
    this.jobLocationList();
    this.getLeaveTypes();
    this.getOrgLeavesCategories();
    const currentYear = new Date().getFullYear();
    for (let year = currentYear + 1; year >= currentYear - 10; year--) {
      this.years.push({ label: year.toString(), value: year });
    }
  }

  intializeForm() {
    this.leavePolicyForm = this.fb.group({
      // Location/Shift Section
      applicableYear: [undefined, Validators.required],
      locationID: [null, Validators.required],
      subLocation: [null, Validators.required],
      shiftId: [null, Validators.required],
      // Leave Category Information
      type: [undefined, Validators.required],
      leaveType: [undefined, Validators.required],
      name: ['', [Validators.required, this.restrictInputValidator]],
      categoryCode: ['', [Validators.required, this.restrictInputLeavecodeValidator]],
      validity: ['', [Validators.required, this.restrictInputNumbersValidator, Validators.max(366)]],
      categoryColor: ['#000000', Validators.required],
      parentId: [undefined],
      // Additional Information
      allowedGender: [undefined, Validators.required],
      allowedMaritalStatus: [undefined, Validators.required],
      excludeWeekends: [undefined, Validators.required],
      excludeHolidays: [undefined, Validators.required],
      isOptionalHoliday: [undefined, Validators.required],
      allowedHalfDay: [undefined, Validators.required],
      isApplicableProRataLeave: [undefined, Validators.required],
      // Future Dates
      futureDatesAllowed: [undefined, Validators.required],
      futureDatesAllowedDays: [null, [this.dependentRequiredValidator('futureDatesAllowed')]],
      // Past Dates
      pastDateAllowed: [undefined, Validators.required],
      pastDatesAllowedDays: [null, [this.dependentRequiredValidator('pastDateAllowed')]],
      // Carry Forward
      carryForwardAllowed: [undefined, Validators.required],
      carryForwardAllowedValue: [null, [this.dependentRequiredValidator('carryForwardAllowed')]],
      // Encash
      encashAllowedType: [undefined, Validators.required],
      encashAllowedValue: [null, [this.dependentRequiredValidator('encashAllowedType')]],
      // Notice Period
      noticeperiodAllowedType: [undefined, Validators.required],
      noticePeriodAllowedValue: [null, [this.dependentRequiredValidator('noticeperiodAllowedType')]],
      noticePeriodFrequencyType: [{ value: null, disabled: true }],
      // Probation Period
      isProbationAllowed: [undefined, Validators.required],
      probationDays: [null, [this.dependentRequiredValidator('isProbationAllowed')]],
      probationFrequencyType: [{ value: null, disabled: true }],
    });
    this.validateAllowedDays()
  }




  validateAllowedDays() {
    this.setupMaxValidation('futureDatesAllowedDays', 'validity');
    this.setupMaxValidation('pastDatesAllowedDays', 'validity');
    this.setupMaxValidation('carryForwardAllowedValue', 'validity');
    this.setupMaxValidation('encashAllowedValue', 'validity');
    this.setupMaxValidation('noticePeriodAllowedValue', 'validity');
    this.setupMaxValidation('noticePeriodAllowedValue', 'validity');
    this.setupMaxValidation('probationDays', 'validity');
  }


  setupMaxValidation(controlName: string, maxControlName: string): void {
    const control = this.leavePolicyForm.get(controlName);
    const maxControl = this.leavePolicyForm.get(maxControlName);

    if (!control || !maxControl) return;

    control.valueChanges.subscribe(value => {
      const max = maxControl.value;

      if (value && +value > max) {
        control.setErrors({ ...control.errors, maxExceeded: true });
      } else {
        if (control.hasError('maxExceeded')) {
          const errors = { ...control.errors };
          delete errors['maxExceeded'];
          control.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    });
  }


  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
        // this.leavePolicyForm.patchValue({
        //   locationID: this.jobLocationDropDownData.find((x: any) => x.jobLocationName === this.updatecloneLeaveCategoryData.locationName),
        // });
        this.getSubLocationByid(this.updatecloneLeaveCategoryData.locationID)
      }
    })
  }

  getSubLocationByid(locationID: any) {
    this.leavePolicyForm.patchValue({
      subLocation: null,
      shiftId: null
    });
    let sublocid = locationID?.id ?? this.updatecloneLeaveCategoryData.locationID
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${sublocid}`).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
        // this.leavePolicyForm.patchValue({
        //   subLocation: this.subLocationsDropdown?.find((x: any) => x.jobSubLocationName === this.updatecloneLeaveCategoryData.subLocationName),
        // });
        this.subloactionid();
        let locsublocid = {
          jobLocationId: this.updatecloneLeaveCategoryData.locationID,
          id: this.updatecloneLeaveCategoryData.subLocation
        }
        this.getShiftBYid(locsublocid)
      }
    })
  }

  navigate() {
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/publishedleavecategory'])
  }

  subloactionid(id?: any) {
    const sublocationId = this.subLocationsDropdown?.find((c: any) => parseInt(c.id) === parseInt(id));
    this.getShiftBYid(sublocationId);
  }

  getShiftBYid(Values: any) {
    if (Values) {
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${Values.jobLocationId}&subLocationId=${Values.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.shiftDropdown = []
          }
          const shiftData = data as ShiftData[];
          const allShifts = shiftData.flatMap(item => item.orgShiftsItems);
          this.shiftsArray = allShifts.map(shift => ({
            label: shift.shiftName,
            value: shift.id
          }));
          // this.leavePolicyForm.patchValue({
          //   shiftId: this.shiftsArray?.find((x: any) => x.label === this.updatecloneLeaveCategoryData?.shiftName)?.value,
          // });
        }
      })
    } else {
    }
  }

  getLeaveTypes() {
    this.subscription = this.http.getData('LeaveType').subscribe({
      next: (data: any) => {
        this.leaveTypes = data;
        this.patchFormValues(this.updatecloneLeaveCategoryData);
      },
      error: (err) => {
        console.error('Error fetching leave types:', err);
        this.leaveTypes = [];
        this.patchFormValues(this.updatecloneLeaveCategoryData);
      }
    });
  }

  getOrgLeavesCategories() {
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (responseData: any) => {
        this, responseData.orgcategory
        this.postOrgPloicyDetailsArray = responseData as [];
        this.publishedCategories = responseData.filter((x: any) => x.status === 'Published');
      },
      error: error => {
        console.error(error);
      }
    });
  }

  private dependentRequiredValidator(controlName: string) {
    return (control: AbstractControl) => {
      const parentControl = control.parent?.get(controlName);
      if (parentControl?.value === true) {
        return Validators.required(control);
      }
      return null;
    };
  }

  private setupDependentFieldListeners() {
    this.leavePolicyForm?.get('futureDatesAllowed')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('futureDatesAllowedDays');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
      }
      daysControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('pastDateAllowed')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('pastDatesAllowedDays');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
      }
      daysControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('carryForwardAllowed')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('carryForwardAllowedValue');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
      }
      daysControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('encashAllowedType')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('encashAllowedValue');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
      }
      daysControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('noticeperiodAllowedType')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('noticePeriodAllowedValue');
      const typeControl = this.leavePolicyForm.get('noticePeriodFrequencyType');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
        typeControl?.enable();
        typeControl?.setValidators([Validators.required]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
        typeControl?.disable();
        typeControl?.clearValidators();
        typeControl?.setValue(null);
      }
      daysControl?.updateValueAndValidity();
      typeControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('isProbationAllowed')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('probationDays');
      const typeControl = this.leavePolicyForm.get('probationFrequencyType');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(1)]);
        typeControl?.enable();
        typeControl?.setValidators([Validators.required]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
        typeControl?.disable();
        typeControl?.clearValidators();
        typeControl?.setValue(null);
      }
      daysControl?.updateValueAndValidity();
      typeControl?.updateValueAndValidity();
    });
  }

  restrictInputValidator(control: AbstractControl) {
    // Implement your input restriction logic
    return null;
  }

  restrictInputLeavecodeValidator(control: AbstractControl) {
    // Implement your input restriction logic
    return null;
  }

  restrictInputNumbersValidator(control: AbstractControl) {
    // Implement your input restriction logic
    return null;
  }

  // Patch form values (for edit mode)
  patchFormValues(data: any) {
    // Find leaveType based on leaveTypeId
    
    this.leavePolicyForm?.patchValue({
      applicableYear: data.applicableYear,
      type: data.type,
      leaveType: data.leaveTypeId,
      name: data.name,
      categoryCode: data.categoryCode,
      validity: data.validity,
      categoryColor: data.categoryColor,
      parentId: data.parentId,
      allowedGender: data.allowedGender,
      allowedMaritalStatus: data.allowedMaritalStatus,
      excludeWeekends: data.excludeWeekends,
      excludeHolidays: data.excludeHolidays,
      isOptionalHoliday: data.isOptionalHoliday,
      allowedHalfDay: data.allowedHalfDay,
      isApplicableProRataLeave: data.isApplicableProRataLeave,
      futureDatesAllowed: data.futureDatesAllowed,
      futureDatesAllowedDays: data.futureDatesAllowedDays,
      pastDateAllowed: data.pastDateAllowed,
      pastDatesAllowedDays: data.pastDatesAllowedDays,
      carryForwardAllowed: data.carryForwardAllowed,
      carryForwardAllowedValue: data.carryForwardAllowedValue,
      encashAllowedType: data.encashAllowedType,
      encashAllowedValue: data.encashAllowedValue,
      noticeperiodAllowedType: data.noticeperiodAllowedType,
      noticePeriodAllowedValue: data.noticePeriodAllowedValue,
      noticePeriodFrequencyType: data.noticePeriodFrequencyType,
      isProbationAllowed: data.isProbationAllowed,
      probationDays: data.probationDays,
      probationFrequencyType: data.probationFrequencyType
    });
    
    // Force update leaveType after a delay to ensure dropdown is ready
    // setTimeout(() => {
    //   this.leavePolicyForm.get('leaveType')?.setValue(leaveTypeValue);
    // }, 100);
    this.setupDependentFieldListeners();
    // Manually trigger value changes for dependent fields
    this.leavePolicyForm?.get('futureDatesAllowed')?.updateValueAndValidity();
    this.leavePolicyForm?.get('pastDateAllowed')?.updateValueAndValidity();
    this.leavePolicyForm?.get('carryForwardAllowed')?.updateValueAndValidity();
    this.leavePolicyForm?.get('encashAllowedType')?.updateValueAndValidity();
    this.leavePolicyForm?.get('noticeperiodAllowedType')?.updateValueAndValidity();
    this.leavePolicyForm?.get('isProbationAllowed')?.updateValueAndValidity();
    this.leavePolicyForm?.get('probationFrequencyType')?.updateValueAndValidity();
  }

  // Form submission
  onSubmit() {
    const formData = this.leavePolicyForm;
    
    let payload = {
      applicableYear: this.leavePolicyForm.value.applicableYear,
      locationID: this.leavePolicyForm.value.locationID.id,
      subLocation: this.leavePolicyForm.value.subLocation.id,
      shiftId: this.leavePolicyForm.value.shiftId,
      type: this.leavePolicyForm.value.type,
      leaveTypeId: this.leavePolicyForm.value.leaveType,
      name: this.leavePolicyForm.value.name,
      categoryCode: this.leavePolicyForm.value.categoryCode,
      validity: this.leavePolicyForm.value.validity,
      categoryColor: this.leavePolicyForm.value.categoryColor,
      parentId: this.leavePolicyForm.value.parentId,
      allowedGender: this.leavePolicyForm.value.allowedGender,
      allowedMaritalStatus: this.leavePolicyForm.value.allowedMaritalStatus,
      excludeWeekends: this.leavePolicyForm.value.excludeWeekends,
      excludeHolidays: this.leavePolicyForm.value.excludeHolidays,
      isOptionalHoliday: this.leavePolicyForm.value.isOptionalHoliday,
      allowedHalfDay: this.leavePolicyForm.value.allowedHalfDay,
      isApplicableProRataLeave: this.leavePolicyForm.value.isApplicableProRataLeave,
      futureDatesAllowed: this.leavePolicyForm.value.futureDatesAllowed,
      futureDatesAllowedDays: this.leavePolicyForm.value.futureDatesAllowedDays ?? 0,
      pastDateAllowed: this.leavePolicyForm.value.pastDateAllowed,
      pastDatesAllowedDays: this.leavePolicyForm.value.pastDatesAllowedDays ?? 0,
      carryForwardAllowed: this.leavePolicyForm.value.carryForwardAllowed,
      carryForwardAllowedValue: this.leavePolicyForm.value.carryForwardAllowedValue ?? 0,
      encashAllowedType: this.leavePolicyForm.value.encashAllowedType,
      encashAllowedValue: this.leavePolicyForm.value.encashAllowedValue ?? 0,
      noticeperiodAllowedType: this.leavePolicyForm.value.noticeperiodAllowedType,
      noticePeriodAllowedValue: this.leavePolicyForm.value.noticePeriodAllowedValue ?? 0,
      noticePeriodFrequencyType: this.leavePolicyForm.value.noticePeriodFrequencyType,
      isProbationAllowed: this.leavePolicyForm.value.isProbationAllowed,
      probationDays: this.leavePolicyForm.value.probationDays ?? 0,
      probationFrequencyType: this.leavePolicyForm.value.probationFrequencyType,
      addedBy: 3356,
      lastModifiedBy: 3356,
      status: "Pending for submission",
      addedDate: new Date(),
      lastModifiedDate: new Date()
    };
    this.http.postdata('OrgLeavesCategories', payload).subscribe({
      next: (data: any) => {
        this.confirmation.openSuccessModal('Leave Category added successfully');
        this.router.navigate(['/settings/timeoff-configurations/leave-categoery/pendingleavecategory']);
        this.leavePolicyForm.reset();
      },
      error: (err: any) => {
        console.log(err);
        this.confirmation.openErrorModal(err.error.message);
      }
    });
  }

  resetForm(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });

  }

  cancel() {
    this.leavePolicyForm.reset();
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/publishedleavecategory']);
  }

  closepopup() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}