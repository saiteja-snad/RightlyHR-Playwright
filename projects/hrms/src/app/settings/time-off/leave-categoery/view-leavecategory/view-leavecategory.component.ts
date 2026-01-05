import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { Iorgcategoryleaves, ShiftData } from '../../../../Interfaces/timoff-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelect } from 'primeng/multiselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { ILetterType } from '../../../../Interfaces/leave-type.model';

@Component({
  selector: 'app-view-leavecategory',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule, MultiSelectModule],
  templateUrl: './view-leavecategory.component.html',
  styleUrl: './view-leavecategory.component.scss',
})
export class ViewLeavecategoryComponent implements OnInit, OnDestroy {
  leavePolicyForm: FormGroup;
  subscription!: Subscription;
  years: { label: string; value: number }[] = [];
  jobLocationDropDownData: any[] = [];
  subLocationsDropdown: any[] = [];
  shiftDropdown: ShiftData[] = [];
  publishedCategories: any[] = [];
  postOrgPloicyDetailsArray: [] = [];
  leaveCategoryType: any[] = [
    { label: 'General', value: 1 },
    { label: 'Flexible', value: 0 },
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
    { label: 'No', value: false },
  ];
  applySandwichOnOptions = [
    { label: 'Weekends', value: 'weekends' },
    { label: 'Holidays', value: 'holidays' },
    { label: 'Both', value: 'both' }
  ];
  sandwichCalculationBasisOptions = [
    { label: 'Start Date/End Date', value: 'start_date/end_date' },
    { label: 'Continuous Leave', value: 'continuous_leave' }
  ];
  sandwichApplicabilityConditionOptions = [
    { label: 'Leave Before Holiday/Weekend', value: 'leave_before_holiday/weekend' },
    { label: 'Leave After Holiday/Weekend', value: 'leave_after_holiday/weekend' },
    { label: 'Leave on Both Sides of Holiday/Weekend', value: 'leave_on_both_sides_of_holiday/weekend' }
  ];
  gapCalculationOptions = [
    { label: 'From Leave End Date', value: 'end_date' },
    { label: 'From Leave Start Date', value: 'start_date' }
  ];
  leaveTypeOptions = [
    { label: 'Fixed Number of Leaves', value: 'Fixed Number of Leaves' },
    { label: 'Monthly Incremental Leaves', value: 'Monthly Incremental Leaves' }
  ];
  shiftsArray = [] as any[];
  updatecloneLeaveCategoryData = {} as Iorgcategoryleaves;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('deletepopup') deletepopup: any;
  leaveTypes: ILetterType[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private confirmation: OpenModalService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.leavePolicyForm = this.fb.group({
      // Location/Shift Section
      applicableYear: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      locationID: [{ value: undefined, disabled: true }, Validators.required],
      subLocation: [{ value: undefined, disabled: true }, Validators.required],
      shiftId: [{ value: undefined, disabled: true }, Validators.required],
      // Leave Category Information
      type: [{ value: undefined, disabled: true }, Validators.required],
      leaveType: [{ value: undefined, disabled: true }, Validators.required],
      name: [
        { value: '', disabled: true },
        [Validators.required, this.restrictInputValidator],
      ],
      categoryCode: [
        { value: '', disabled: true },
        [Validators.required, this.restrictInputLeavecodeValidator],
      ],
      validity: [
        { value: '', disabled: true },
        [Validators.required, this.restrictInputNumbersValidator],
      ],
      categoryColor: [
        { value: '#000000', disabled: true },
        Validators.required,
      ],
      parentId: [{ value: undefined, disabled: true }],
      // Additional Information
      allowedGender: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      allowedMaritalStatus: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      excludeWeekends: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      excludeHolidays: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      isOptionalHoliday: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      allowedHalfDay: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      isApplicableProRataLeave: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      // Future Dates
      futureDatesAllowed: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      futureDatesAllowedDays: [
        { value: undefined, disabled: true },
        [this.dependentRequiredValidator('futureDatesAllowed')],
      ],
      // Past Dates
      pastDateAllowed: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      pastDatesAllowedDays: [
        { value: undefined, disabled: true },
        [this.dependentRequiredValidator('pastDateAllowed')],
      ],
      // Carry Forward
      carryForwardAllowed: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      carryForwardAllowedValue: [
        { value: undefined, disabled: true },
        [this.dependentRequiredValidator('carryForwardAllowed')],
      ],
      // Encash
      encashAllowedType: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      encashAllowedValue: [
        { value: undefined, disabled: true },
        [this.dependentRequiredValidator('encashAllowedType')],
      ],
      // Notice Period
      noticeperiodAllowedType: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      noticePeriodAllowedValue: [
        { value: undefined, disabled: true },
        [this.dependentRequiredValidator('noticeperiodAllowedType')],
      ],
      noticePeriodFrequencyType: [{ value: undefined, disabled: true }, Validators.required],
      // Probation Period
      isProbationAllowed: [
        { value: undefined, disabled: true },
        Validators.required,
      ],
      probationDays: [
        { value: undefined, disabled: true },
        [this.dependentRequiredValidator('isProbationAllowed')],
      ],
      probationFrequencyType: [{ value: undefined, disabled: true }, Validators.required],
      // New Leave Category Fields
      minimumAdvanceApplyDays: [{ value: null, disabled: true }, Validators.required],
      maxLeaveDurationCalendarDays: [{ value: null, disabled: true }, Validators.required],
      includeWeekends: [{ value: null, disabled: true }, Validators.required],
      includeHolidays: [{ value: null, disabled: true }, Validators.required],
      allowLeaveCombination: [{ value: false, disabled: true }, Validators.required],
      restrictedAdjacentLeaveTypes: [{ value: null, disabled: true }],
      blockLeaveOnWeekends: [{ value: null, disabled: true }],
      blockPreviousDayLeave: [{ value: null, disabled: true }],
      blockNextDayLeave: [{ value: null, disabled: true }],
      minimumGapBetweenSameLeaveType: [{ value: 30, disabled: true }, Validators.required],
      gapCalculationBasis: [{ value: null, disabled: true }, Validators.required],
      enableSandwichPolicy: [{ value: false, disabled: true }, Validators.required],
      applySandwichOn: [{ value: null, disabled: true }],
      sandwichCalculationBasis: [{ value: null, disabled: true }],
      sandwichApplicabilityCondition: [{ value: null, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.getLeaveTypes();
    this.updatecloneLeaveCategoryData = JSON.parse(
      localStorage.getItem('viewleavecategory') ?? '{}'
    );
    this.setupDependentFieldListeners();
    this.jobLocationList();
    
    this.getOrgLeavesCategories();
    this.getparentIdLC(
      this.updatecloneLeaveCategoryData.parentId,
      this.updatecloneLeaveCategoryData.parentId
    );
    this.setupDependentFieldListeners();
    this.validateAllowedDays();
    this.jobLocationList();
    this.getOrgLeavesCategories();
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push({ label: year.toString(), value: year });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  navigate() {
    this.router.navigate([
      '/settings/timeoff-configurations/leave-categoery/publishedleavecategory',
    ]);
  }
  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
        this.patchFormValues(this.updatecloneLeaveCategoryData);
      },
    });
  }
  OnClickLocation(id: any) {
    const locationID = id;
    console.log(locationID);
    this.getSubLocationByid(locationID);
  }
  getSubLocationByid(locationID: any) {
    this.subscription = this.http
      .getData(`JobLocation/sub-location-by-joblocation/${locationID}`)
      .subscribe({
        next: (data: any) => {
          this.subLocationsDropdown = data.jobSubLocations;
          this.subloactionid();
        },
      });
  }

  subloactionid(id?: any) {
    const sublocationId = this.subLocationsDropdown.find(
      (c: any) => parseInt(c.id) === parseInt(id)
    );
    this.getShiftBYid(sublocationId);
  }

  getShiftBYid(Values: any) {
    if (Values) {
      this.subscription = this.http
        .getData(
          `orgShifts/getshiftlocation?locationId=${Values.jobLocationId}&subLocationId=${Values.id}`
        )
        .subscribe({
          next: (data: any) => {
            if (data.length === 0) {
              this.shiftDropdown = [];
            }
            const shiftData = data as ShiftData[];
            const allShifts = shiftData.flatMap((item) => item.orgShiftsItems);
            this.shiftsArray = allShifts.map((shift) => ({
              label: shift.shiftName,
              value: shift.id,
            }));
          },
        });
    } else {
    }
  }

  getOrgLeavesCategories() {
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (responseData: any) => {
        this, responseData.orgcategory;
        console.log(responseData);
        this.postOrgPloicyDetailsArray = responseData as [];
        this.publishedCategories = responseData.filter(
          (x: any) => x.status === 'Published'
        );
      },
      error: (error) => {
        console.error(error);
      },
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
    this.leavePolicyForm
      .get('futureDatesAllowed')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get('futureDatesAllowedDays');
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
          daysControl?.setValue(undefined);
        }
        daysControl?.updateValueAndValidity();
      });

    this.leavePolicyForm
      .get('pastDateAllowed')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get('pastDatesAllowedDays');
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
          daysControl?.setValue(undefined);
        }
        daysControl?.updateValueAndValidity();
      });
    this.leavePolicyForm
      .get('carryForwardAllowed')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get(
          'carryForwardAllowedValue'
        );
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
          daysControl?.setValue(undefined);
        }
        daysControl?.updateValueAndValidity();
      });

    this.leavePolicyForm
      .get('encashAllowedType')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get('encashAllowedValue');
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
          daysControl?.setValue(undefined);
        }
        daysControl?.updateValueAndValidity();
      });

    this.leavePolicyForm
      .get('noticeperiodAllowedType')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get(
          'noticePeriodAllowedValue'
        );
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
          daysControl?.setValue(undefined);
        }
        daysControl?.updateValueAndValidity();
      });

    this.leavePolicyForm
      .get('isProbationAllowed')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get('probationDays');
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          daysControl?.disable();
          daysControl?.clearValidators();
          daysControl?.setValue(undefined);
        }
        daysControl?.updateValueAndValidity();
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

  validateAllowedDays() {
    this.setupMaxValidation('futureDatesAllowedDays', 'validity');
    this.setupMaxValidation('pastDatesAllowedDays', 'validity');
    this.setupMaxValidation('carryForwardAllowedValue', 'validity');
    this.setupMaxValidation('encashAllowedValue', 'validity');
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

  private maxValidDaysValidator(maxControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const maxControl = control.parent.get(maxControlName);
      const maxValue = maxControl?.value;
      if (control.value && maxValue && +control.value > +maxValue) {
        return { maxExceeded: true };
      }
      return null;
    };
  }

  onNumberInput(event: Event, fieldName: string): void {
    const inputElement = event.target as HTMLInputElement;
    let sanitizedValue = inputElement.value.replace(/[^0-9.]/g, '');
    const decimalCheck = sanitizedValue.split('.');
    if (decimalCheck.length > 2) {
      sanitizedValue = decimalCheck[0] + '.' + decimalCheck[1];
    }
    inputElement.value = sanitizedValue;
    if (/^\d*\.?\d*$/.test(sanitizedValue)) {
      this.leavePolicyForm.get(fieldName)?.setValue(sanitizedValue);
    }
  }

  parentIdData = {} as any;
  getparentIdLC(id: any, parentid: any) {
    if (id) {
      this.subscription = this.http
        .getData(`OrgLeavesCategories/${id}?CategoryId=${parentid}`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.parentIdData = data;
            this.leavePolicyForm.patchValue({
              parentId: this.parentIdData.name,
            });
          },
        });
    } else {
    }
  }

  getLeaveTypes() {
    this.subscription = this.http.getData('LeaveType').subscribe({
      next: (data: any) => {
        this.leaveTypes = data;
        // this.patchFormValues(this.updatecloneLeaveCategoryData);
      },
      error: (err) => {
        console.error('Error fetching leave types:', err);
        this.leaveTypes = [];
      }
    });
  }

  // Patch form values (for edit mode)
  patchFormValues(data: any) {
    // if (!this.jobLocationDropDownData.length || !this.leaveTypes.length) return;
    // debugger
    const leaveTypeValue = this.leaveTypes.find(lt => lt.id === data.leaveTypeId)?.id || '';
    this.leavePolicyForm.patchValue({
      applicableYear: data.applicableYear,
      locationID: data.locationName,
      subLocation: data.subLocationName,
      shiftId: data.shiftName,
      type: data.type,
      leaveType: leaveTypeValue,
      name: data.name,
      categoryCode: data.categoryCode,
      validity: data.validity,
      categoryColor: data.categoryColor,
      parentId: this.parentIdData.name,
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
      restrictedAdjacentLeaveTypes: data.restrictedAdjacentLeaveTypes ? data.restrictedAdjacentLeaveTypes.split(',').map((id: string) => parseInt(id.trim())) : null,
      blockLeaveOnWeekends: data.blockLeaveOnWeekends,
      blockPreviousDayLeave: data.blockPreviousDayLeave,
      blockNextDayLeave: data.blockNextDayLeave,
      minimumGapBetweenSameLeaveType: data.minimumGapBetweenSameLeaveType,
      gapCalculationBasis: data.gapCalculationBasis,
      enableSandwichPolicy: data.enableSandwichPolicy,
      applySandwichOn: data.applySandwichOn,
      sandwichCalculationBasis: data.sandwichCalculationBasis,
      sandwichApplicabilityCondition: data.sandwichApplicabilityCondition
    });

    // Manually trigger value changes for dependent fields
    this.leavePolicyForm.get('futureDatesAllowed')?.updateValueAndValidity();
    this.leavePolicyForm.get('pastDateAllowed')?.updateValueAndValidity();
    this.leavePolicyForm.get('carryForwardAllowed')?.updateValueAndValidity();
    this.leavePolicyForm.get('encashAllowedType')?.updateValueAndValidity();
    this.leavePolicyForm
      .get('noticeperiodAllowedType')
      ?.updateValueAndValidity();
    this.leavePolicyForm.get('isProbationAllowed')?.updateValueAndValidity();
    this.validateAllowedDays();
  }

  // Form submission
  onSubmit() {
    const formData = this.leavePolicyForm.value;
    console.log('Form Data:', formData);
    let payload = {
      applicableYear: this.leavePolicyForm.value.applicableYear,
      locationID: this.leavePolicyForm.value.locationID,
      subLocation: this.leavePolicyForm.value.subLocation,
      shiftId: this.leavePolicyForm.value.shiftId,
      type: this.leavePolicyForm.value.type,
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
      isApplicableProRataLeave:
        this.leavePolicyForm.value.isApplicableProRataLeave,
      futureDatesAllowed: this.leavePolicyForm.value.futureDatesAllowed,
      futureDatesAllowedDays:
        this.leavePolicyForm.value.futureDatesAllowedDays ?? 0,
      pastDateAllowed: this.leavePolicyForm.value.pastDateAllowed,
      pastDatesAllowedDays:
        this.leavePolicyForm.value.pastDatesAllowedDays ?? 0,
      carryForwardAllowed: this.leavePolicyForm.value.carryForwardAllowed,
      carryForwardAllowedValue:
        this.leavePolicyForm.value.carryForwardAllowedValue ?? 0,
      encashAllowedType: this.leavePolicyForm.value.encashAllowedType,
      encashAllowedValue: this.leavePolicyForm.value.encashAllowedValue ?? 0,
      noticeperiodAllowedType:
        this.leavePolicyForm.value.noticeperiodAllowedType,
      noticePeriodAllowedValue:
        this.leavePolicyForm.value.noticePeriodAllowedValue ?? 0,
      isProbationAllowed: this.leavePolicyForm.value.isProbationAllowed,
      probationDays: this.leavePolicyForm.value.probationDays ?? 0,
      probationFrequencyType: this.leavePolicyForm.value.leavePolicyForm,
      addedBy: 3356,
      lastModifiedBy: 3356,
      status: 'Pending for submission',
      addedDate: new Date(),
      lastModifiedDate: new Date(),
    };

    this.http.postdata('OrgLeavesCategories', payload).subscribe({
      next: (data: any) => {
        this.confirmation.openSuccessModal('Leave Category added successfully');
        this.router.navigate([
          '/settings/employee-fields/manage-leave-categories/pending-for-submit',
        ]);
        this.resteAndNavigateToPublished();
      },
      error: (err: any) => {
        this.confirmation.openErrorModal(err.error.message);
      },
    });
  }

  cloneCategory(leavePolicyForm: FormGroup) {

    localStorage.setItem(
      'cloneleavecategory',
      JSON.stringify(this.updatecloneLeaveCategoryData)
    );
    this.router.navigate([
      '/settings/timeoff-configurations/cloneleavecategory',
    ]);

  }

  resetForm(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  resteAndNavigateToPublished() {
    this.modalService.dismissAll();
    this.leavePolicyForm.reset();
    this.router.navigate([
      '/settings/timeoff-configurations/leave-categoery/publishedleavecategory',
    ]);
  }
}
