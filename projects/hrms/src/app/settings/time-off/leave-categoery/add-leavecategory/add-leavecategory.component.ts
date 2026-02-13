import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { ShiftData } from '../../../../Interfaces/timoff-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
import { IJob } from '../../../../Interfaces/letters-model';
import { ILetterType } from '../../../../Interfaces/leave-type.model';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-add-leavecategory',
  imports: [CommonModule, Select, ReactiveFormsModule,MultiSelectModule, TranslateModule],
  templateUrl: './add-leavecategory.component.html',
  styleUrl: './add-leavecategory.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class AddLeavecategoryComponent implements OnInit, OnDestroy {
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
  gapCalculationOptions = [
    
    { label: 'From Leave Start Date', value: 'start_date' },
    { label: 'From Leave End Date', value: 'end_date' },
  ];
  leaveTypeOptions = [
    { label: 'Fixed Number of Leaves', value: 'Fixed Number of Leaves' },
    { label: 'Monthly Incremental Leaves', value: 'Monthly Incremental Leaves' }
  ];
  applySandwichOnOptions = [
    { label: 'Weekends', value: 'weekends' },
    { label: 'Holidays', value: 'holidays' },
    { label: 'Both', value: 'both' }
  ];
  sandwichCalculationBasisOptions = [
    { label: 'Start Date/End Date', value: 'start_date/end_date' },
    // { label: 'Continuous Leave', value: 'continuous_leave' }
  ];
  sandwichApplicabilityConditionOptions = [
    // { label: 'Leave Before Holiday/Weekend', value: 'leave_before_holiday/weekend' },
    // { label: 'Leave After Holiday/Weekend', value: 'leave_after_holiday/weekend' },
    { label: 'Leave on Both Sides of Holiday/Weekend', value: 'leave_on_both_sides_of_holiday/weekend' }
  ];
  adjacentLeaveTypeRuleOptions = [
    { label: 'Same Category', value: 'same_category' },
    { label: 'Different Category', value: 'different_category' },
    { label: 'Both', value: 'both' }
  ];
  shiftsArray = [] as any[];
  leaveTypes : ILetterType[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo = {} as IJob;
  constructor(private fb: FormBuilder, private http: HttpService, private confirmation: OpenModalService,
    private router: Router, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.jobLocationList();
    // this.getOrgLeavesCategories();
    this.getLeaveTypes();
    const currentYear = new Date().getFullYear();

    for (let year = currentYear + 1; year >= currentYear - 10; year--) {
      this.years.push({ label: year.toString(), value: year });
    }

    this.leavePolicyForm = this.fb.group({
      // Location/Shift Section
      applicableYear: [undefined, Validators.required],
      locationID: [undefined, Validators.required],
      subLocation: [undefined, Validators.required],
      shiftId: [undefined, Validators.required],
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
      futureDatesAllowedDays: [{ value: null, disabled: true }, [this.dependentRequiredValidator('futureDatesAllowed'), this.maxValidDaysValidator('validity')]],
      // Past Dates
      pastDateAllowed: [undefined, Validators.required],
      pastDatesAllowedDays: [{ value: null, disabled: true }, [this.dependentRequiredValidator('pastDateAllowed')]],
      // Carry Forward
      carryForwardAllowed: [undefined, Validators.required],
      carryForwardAllowedValue: [{ value: null, disabled: true }, [this.dependentRequiredValidator('carryForwardAllowed'),]],
      // Encash
      encashAllowedType: [undefined, Validators.required],
      encashAllowedValue: [{ value: null, disabled: true }, [this.dependentRequiredValidator('encashAllowedType'),]],
      // Notice Period
      noticeperiodAllowedType: [undefined, Validators.required],
      noticePeriodAllowedValue: [{ value: null, disabled: true }, [this.dependentRequiredValidator('noticeperiodAllowedType'),]],
      noticePeriodFrequencyType: [{ value: null, disabled: true }],
      // Probation Period
      isProbationAllowed: [undefined, Validators.required],
      probationDays: [{ value: null, disabled: true }, [this.dependentRequiredValidator('isProbationAllowed')]],
      probationFrequencyType: [{ value: null, disabled: true }],
      // New Leave Category Fields
      minimumAdvanceApplyDays: [undefined, [Validators.min(1), Validators.max(366)]],
      maxLeaveDurationCalendarDays: [null, [Validators.min(1), Validators.max(366)]],
      includeWeekends: [{ value: false, disabled: true }],
      includeHolidays: [{ value: false, disabled: true }],
      allowLeaveCombination: [true],
      restrictedAdjacentLeaveTypes: [null],
      blockLeaveOnWeekends: [null],
      blockPreviousDayLeave: [null],
      blockNextDayLeave: [null],
      minimumGapBetweenSameLeaveType: [30,[Validators.min(1), Validators.max(366)]],
      gapCalculationBasis: [null],
      enableSandwichPolicy: [false],
      applySandwichOn: [null,],
      sandwichCalculationBasis: [null],
      sandwichApplicabilityCondition: [null],
      adjacentLeaveTypeRule: [null]
    });
    this.setupDependentFieldListeners();
    this.validateAllowedDays();
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


  onNumberInput(event: Event, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    let sanitizedValue = inputElement.value.replace(/[^0-9]/g, '');
    
    // Set the sanitized value back to the input
    inputElement.value = sanitizedValue;
    
    // Update the form control value only if the value contains digits
    if (/^\d*$/.test(sanitizedValue)) {
      this.leavePolicyForm.get(fieldName)?.setValue(sanitizedValue);
    }
  }





  maxValidDaysValidator(maxField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const max = parent.get(maxField)?.value;
      if (max != null && control.value != null && control.value > max) {
        console.log(`Max value exceeded: ${control.value} > ${max}`);

        return { maxExceeded: true };
      }
      return null;
    };
  }


  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
      }
    })
  }

  getLeaveTypes() {
    this.subscription = this.http.getData(`LeaveType`).subscribe({
      next: (data: any) => {
        this.leaveTypes = data as ILetterType[];
      },
      error: (err: any) => {
        this.leaveTypes = [];
      }
    });
  }

  OnClickLocation(id: any) {
    const locationID = id;
    this.leavePolicyForm.get('subLocation')?.reset();
    this.leavePolicyForm.get('shiftId')?.reset();
    this.getSubLocationByid(locationID);
  }

  getSubLocationByid(locationID: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${locationID}`).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
        this.subloactionid();
      }
    })
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
        }
      })
    } else {
    }
  }

  getOrgLeavesCategories(locationId?: any, sublocationId?: any, year?: any, shiftId?: any) {
    let url = 'OrgLeavesCategories';
    const params = [];
    
    if (locationId) params.push(`locationId=${locationId}`);
    if (sublocationId) params.push(`sublocationId=${sublocationId}`);
    if (year) params.push(`year=${year}`);
    if (shiftId) params.push(`shiftId=${shiftId}`);
    params.push(`status=Published`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    this.subscription = this.http.getData(url).subscribe({
      next: (responseData: any) => {
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

    this.leavePolicyForm?.get('allowLeaveCombination')?.valueChanges.subscribe((value: any) => {
      const restrictedTypesControl = this.leavePolicyForm.get('restrictedAdjacentLeaveTypes');
      const blockPreviousControl = this.leavePolicyForm.get('blockPreviousDayLeave');
      const blockNextControl = this.leavePolicyForm.get('blockNextDayLeave');
      
      if (value === false ) {
        restrictedTypesControl?.setValidators([Validators.required]);
        blockPreviousControl?.setValidators([Validators.required]);
        blockNextControl?.setValidators([Validators.required]);
      } else {
        restrictedTypesControl?.clearValidators();
        blockPreviousControl?.clearValidators();
        blockNextControl?.clearValidators();
        restrictedTypesControl?.setValue(null);
        blockPreviousControl?.setValue(null);
        blockNextControl?.setValue(null);
        restrictedTypesControl?.markAsUntouched();
        blockPreviousControl?.markAsUntouched();
        blockNextControl?.markAsUntouched();
      }
      restrictedTypesControl?.updateValueAndValidity();
      blockPreviousControl?.updateValueAndValidity();
      blockNextControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('enableSandwichPolicy')?.valueChanges.subscribe((value: any) => {
      const sandwichApplicabilityConditionControl = this.leavePolicyForm.get('sandwichApplicabilityCondition');
      const sandwichCalculationBasisControl = this.leavePolicyForm.get('sandwichCalculationBasis');
      const applySandwichOnControl = this.leavePolicyForm.get('applySandwichOn');
      const adjacentLeaveTypeRuleControl = this.leavePolicyForm.get('adjacentLeaveTypeRule');
          if (value === true) {
            sandwichApplicabilityConditionControl?.setValidators([Validators.required]);
            sandwichCalculationBasisControl?.setValidators([Validators.required]);
            applySandwichOnControl?.setValidators([Validators.required]);
            adjacentLeaveTypeRuleControl?.setValidators([Validators.required]);
          } else {
            sandwichApplicabilityConditionControl?.clearValidators();
            sandwichCalculationBasisControl?.clearValidators();
            applySandwichOnControl?.clearValidators();
            adjacentLeaveTypeRuleControl?.clearValidators();
            sandwichApplicabilityConditionControl?.setValue(null);
            sandwichCalculationBasisControl?.setValue(null);
            applySandwichOnControl?.setValue(null);
            adjacentLeaveTypeRuleControl?.setValue(null);
            sandwichApplicabilityConditionControl?.markAsUntouched();
            sandwichCalculationBasisControl?.markAsUntouched();
            applySandwichOnControl?.markAsUntouched();
            adjacentLeaveTypeRuleControl?.markAsUntouched();
          }
          sandwichApplicabilityConditionControl?.updateValueAndValidity();
          sandwichCalculationBasisControl?.updateValueAndValidity();
          applySandwichOnControl?.updateValueAndValidity();
          adjacentLeaveTypeRuleControl?.updateValueAndValidity();
      });

    this.leavePolicyForm?.get('sandwichCalculationBasis')?.valueChanges.subscribe((value: any) => {
      const sandwichApplicabilityConditionControl = this.leavePolicyForm.get('sandwichApplicabilityCondition');
      if (value === 'start_date/end_date') {
        sandwichApplicabilityConditionControl?.setValue('leave_on_both_sides_of_holiday/weekend');
        sandwichApplicabilityConditionControl?.disable();
      } else {
        sandwichApplicabilityConditionControl?.enable();
      }
      });
    this.leavePolicyForm?.get('minimumGapBetweenSameLeaveType')?.valueChanges.subscribe((value: any) => {
      const gapCalculationBasisControl = this.leavePolicyForm.get('gapCalculationBasis');
      if (value && value > 0) {
        gapCalculationBasisControl?.setValidators([Validators.required]);
      } else {
        gapCalculationBasisControl?.clearValidators();
        gapCalculationBasisControl?.setValue(null);
      }
      gapCalculationBasisControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('maxLeaveDurationCalendarDays')?.valueChanges.subscribe((value: any) => {
      const includeWeekendsControl = this.leavePolicyForm.get('includeWeekends');
      const includeHolidaysControl = this.leavePolicyForm.get('includeHolidays');
      
      if (value && value > 0) {
        includeWeekendsControl?.enable();
        includeHolidaysControl?.enable();
      } else {
        includeWeekendsControl?.disable();
        includeHolidaysControl?.disable();
        includeWeekendsControl?.setValue(false);
        includeHolidaysControl?.setValue(false);
      }
      includeWeekendsControl?.updateValueAndValidity();
      includeHolidaysControl?.updateValueAndValidity();
    });
       
    // Update published categories when location/sublocation/year/shift changes
    this.leavePolicyForm?.get('applicableYear')?.valueChanges.subscribe(() => this.updatePublishedCategories());
    this.leavePolicyForm?.get('locationID')?.valueChanges.subscribe(() => this.updatePublishedCategories());
    this.leavePolicyForm?.get('subLocation')?.valueChanges.subscribe(() => this.updatePublishedCategories());
    this.leavePolicyForm?.get('shiftId')?.valueChanges.subscribe(() => this.updatePublishedCategories());
  }

  updatePublishedCategories() {
    const year = this.leavePolicyForm.get('applicableYear')?.value;
    const locationId = this.leavePolicyForm.get('locationID')?.value;
    const sublocationId = this.leavePolicyForm.get('subLocation')?.value;
    const shiftId = this.leavePolicyForm.get('shiftId')?.value;
    
    if (year && locationId && sublocationId && shiftId) {
      this.getOrgLeavesCategories(locationId, sublocationId, year, shiftId);
    }
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

  navigate() {
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/pendingleavecategory']);
  }

  // Patch form values (for edit mode)
  patchFormValues(data: any) {
    this.leavePolicyForm.patchValue({
      applicableYear: data.applicableYear,
      locationID: data.locationID,
      subLocation: data.subLocation,
      shiftId: data.shiftId,
      type: data.type,
      leaveType: data.leaveType,
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
      probationFrequencyType: data.probationFrequencyType,
      // New Leave Category Fields
      minimumAdvanceApplyDays: data.minimumAdvanceApplyDays,
      maxLeaveDurationCalendarDays: data.maxLeaveDurationCalendarDays,
      includeWeekends: data.includeWeekends,
      includeHolidays: data.includeHolidays,
      allowLeaveCombination: data.allowLeaveCombination,
      restrictedAdjacentLeaveTypes: data.restrictedAdjacentLeaveTypes,
      blockLeaveOnWeekends: data.blockLeaveOnWeekends,
      blockPreviousDayLeave: data.blockPreviousDayLeave,
      blockNextDayLeave: data.blockNextDayLeave,
      minimumGapBetweenSameLeaveType: data.minimumGapBetweenSameLeaveType,
      gapCalculationBasis: data.gapCalculationBasis,
      enableSandwichPolicy: data.enableSandwichPolicy,
      sandwichApplicabilityCondition: data.sandwichApplicabilityCondition,
      adjacentLeaveTypeRule: data.adjacentLeaveTypeRule,
      sandwichCalculationBasis: data.sandwichCalculationBasis,
      applySandwichOn: data.applySandwichOn

    });
    // Manually trigger value changes for dependent fields
    this.leavePolicyForm.get('futureDatesAllowed')?.updateValueAndValidity();
    this.leavePolicyForm.get('pastDateAllowed')?.updateValueAndValidity();
    this.leavePolicyForm.get('carryForwardAllowed')?.updateValueAndValidity();
    this.leavePolicyForm.get('encashAllowedType')?.updateValueAndValidity();
    this.leavePolicyForm.get('noticeperiodAllowedType')?.updateValueAndValidity();
    this.leavePolicyForm.get('isProbationAllowed')?.updateValueAndValidity();
  }

  // Form submission
  onSubmit() {
    const formData = this.leavePolicyForm.value;
        
    let payload = {
      applicableYear: this.leavePolicyForm.value.applicableYear,
      locationID: this.leavePolicyForm.value.locationID,
      subLocation: this.leavePolicyForm.value.subLocation,
      shiftId: this.leavePolicyForm.value.shiftId,
      type: this.leavePolicyForm.value.type,
      leaveTypeId: formData.leaveType,
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
      // New Leave Category Fields
      minimumAdvanceApplyDays: this.leavePolicyForm.value.minimumAdvanceApplyDays || null,
      maxLeaveDurationCalendarDays: this.leavePolicyForm.value.maxLeaveDurationCalendarDays || null,
      includeWeekends: this.leavePolicyForm.value.includeWeekends,
      includeHolidays: this.leavePolicyForm.value.includeHolidays,
      allowLeaveCombination: this.leavePolicyForm.value.allowLeaveCombination,
      restrictedAdjacentLeaveTypes: this.leavePolicyForm.value?.restrictedAdjacentLeaveTypes?.join(','),
      blockLeaveOnWeekends: this.leavePolicyForm.value.blockLeaveOnWeekends,
      blockPreviousDayLeave: this.leavePolicyForm.value.blockPreviousDayLeave,
      blockNextDayLeave: this.leavePolicyForm.value.blockNextDayLeave,
      minimumGapBetweenSameLeaveType: this.leavePolicyForm.value.minimumGapBetweenSameLeaveType || null,
      gapCalculationBasis: this.leavePolicyForm.value.gapCalculationBasis,
      enableSandwichPolicy: this.leavePolicyForm.value.enableSandwichPolicy,
      applySandwichOn: this.leavePolicyForm.value.applySandwichOn,
      sandwichCalculationBasis: this.leavePolicyForm.value.sandwichCalculationBasis,
      sandwichApplicabilityCondition: this.leavePolicyForm.get('sandwichApplicabilityCondition')?.value,
      adjacentLeaveTypeRule: this.leavePolicyForm.value.adjacentLeaveTypeRule,
      addedBy: this.empinfo.employeeId,
      lastModifiedBy: this.empinfo.employeeId,
      status: "Pending for submission",
      addedDate: new Date(),
      lastModifiedDate: new Date()
    };
    this.http.postdata('OrgLeavesCategories', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.confirmation.openSuccessModal('Leave Category added successfully');
        this.router.navigate(['/settings/timeoff-configurations/leave-categoery/pendingleavecategory']);
        this.leavePolicyForm.reset();
      },
      error: (err: any) => {
        this.confirmation.openErrorModal(err || 'An error occurred while adding Leave Category.');
      }
    });
  }

  resetForm(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cancel() {
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/pendingleavecategory']);
    this.leavePolicyForm.reset();

  }

  closepopup() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
      this.destroy$.next(true);
    this.destroy$.unsubscribe();
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}
