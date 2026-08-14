import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { Iorgcategoryleaves, ShiftData } from '../../../../Interfaces/timoff-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
import { IJob } from '../../../../Interfaces/letters-model';
import { ILetterType } from '../../../../Interfaces/leave-type.model';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-update-leavecategory',
  imports: [CommonModule, Select, ReactiveFormsModule, TranslateModule, MultiSelectModule],
  templateUrl: './update-leavecategory.component.html',
  styleUrl: './update-leavecategory.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UpdateLeavecategoryComponent {
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
  gapCalculationOptions = [

    { label: 'From Leave Start Date', value: 'start_date' },
    { label: 'From Leave End Date', value: 'end_date' },
  ];
  frequencyTypes = [
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Half Yearly', value: 'HALF_YEARLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ];
  cycleHandlingOptions = [
    { label: 'Frozen', value: 'FROZEN' },
    { label: 'Carry Forward', value: 'CARRY_FORWARD' },
    { label: 'Lapsed', value: 'LAPSED' },
  ];
  leaveTypeOptions = [
    { label: 'Fixed Number of Leaves', value: 'Fixed Number of Leaves' },
    { label: 'Monthly Incremental Leaves', value: 'Monthly Incremental Leaves' }
  ];
  shiftsArray = [] as any[];
  leaveTypes: ILetterType[] = [];
  updateLeaveCategoryData = {} as Iorgcategoryleaves;
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo = {} as IJob;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private confirmation: OpenModalService,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.intializeForm();
    this.updateLeaveCategoryData = JSON.parse(
      localStorage.getItem('updateleavecategory') ?? '{}'
    );
    this.jobLocationList();
    this.patchFormValues(this.updateLeaveCategoryData);
    // this.getOrgLeavesCategories();
    this.validateAllowedDays();
    this.getLeaveTypes();
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
      subLocation: [undefined, Validators.required],
      shiftId: [undefined, Validators.required],
      // Leave Category Information
      type: [undefined, Validators.required],
      leaveType: [undefined, Validators.required],
      name: ['', [Validators.required, this.restrictInputValidator]],
      categoryCode: [
        '',
        [Validators.required, this.restrictInputLeavecodeValidator],
      ],
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
      futureDatesAllowedDays: [
        { value: null, disabled: true },
        [this.dependentRequiredValidator('futureDatesAllowed'), this.maxValidDaysValidator('validity')],
      ],
      // Past Dates
      pastDateAllowed: [undefined, Validators.required],
      pastDatesAllowedDays: [
        { value: null, disabled: true },
        [this.dependentRequiredValidator('pastDateAllowed')],
      ],
      // Carry Forward
      carryForwardAllowed: [undefined, Validators.required],
      carryForwardAllowedValue: [
        { value: null, disabled: true },
        [this.dependentRequiredValidator('carryForwardAllowed')],
      ],
      // Encash
      encashAllowedType: [undefined, Validators.required],
      encashAllowedValue: [
        { value: null, disabled: true },
        [this.dependentRequiredValidator('encashAllowedType')],
      ],
      // Notice Period
      noticeperiodAllowedType: [undefined, Validators.required],
      noticePeriodAllowedValue: [
        { value: null, disabled: true },
        [this.dependentRequiredValidator('noticeperiodAllowedType')],
      ],
      noticePeriodFrequencyType: [{ value: null }],
      // Probation Period
      isProbationAllowed: [undefined, Validators.required],
      probationDays: [
        { value: null, disabled: true },
        [this.dependentRequiredValidator('isProbationAllowed')],
      ],
      probationFrequencyType: [{ value: null }],
      // New Leave Category Fields
      minimumAdvanceApplyDays: [null, [Validators.min(1), Validators.max(366)]],
      maxLeaveDurationCalendarDays: [null, [Validators.min(1), Validators.max(366)]],
      includeWeekends: [{ value: false, disabled: true }],
      includeHolidays: [{ value: false, disabled: true }],
      allowLeaveCombination: [true],
      restrictedAdjacentLeaveTypes: [null],
      blockLeaveOnWeekends: [null],
      blockPreviousDayLeave: [null],
      blockNextDayLeave: [null],
      minimumGapBetweenSameLeaveType: [null, [Validators.min(1), Validators.max(366)]],
      gapCalculationBasis: [null],
      enableSandwichPolicy: [false],
      applySandwichOn: [null,],
      sandwichCalculationBasis: [null],
      sandwichApplicabilityCondition: [null],
      adjacentLeaveTypeRule: [null],
      extendLastWorkingDay:[null],
      entitlementFrequency: [null, Validators.required],
      entitlementCycleHandling: [null, Validators.required],
      allowPastCycleApplication: [null, Validators.required],
    });
  }

  OnClickLocation(id: any) {
    const locationID = id;
    this.getSubLocationByid(locationID);
  }

  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
        const foundLocation = this.jobLocationDropDownData.find(
          (x: any) => x.id === this.updateLeaveCategoryData.locationID
        );
        console.log(foundLocation);
        console.log(this.updateLeaveCategoryData.locationID);
        
        
        this.leavePolicyForm.patchValue({
          locationID: foundLocation?.id
        });
        this.getSubLocationByid(this.updateLeaveCategoryData.locationID);
      },
    });
  }


  private updateDependentFieldState(parentControlName: string, dependentControlName: string) {
    const parentValue = this.leavePolicyForm.get(parentControlName)?.value;
    const dependentControl = this.leavePolicyForm.get(dependentControlName);

    if (parentValue) {
      dependentControl?.enable();
      dependentControl?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      dependentControl?.disable();
      dependentControl?.clearValidators();
      dependentControl?.setValue(0);
    }
    dependentControl?.updateValueAndValidity();
  }



  private setupDependentFieldListenerS() {
    this.leavePolicyForm?.get('futureDatesAllowed')?.valueChanges.subscribe((value: any) => {
      this.updateDependentFieldState('futureDatesAllowed', 'futureDatesAllowedDays');
    });

    this.leavePolicyForm?.get('pastDateAllowed')?.valueChanges.subscribe((value: any) => {
      this.updateDependentFieldState('pastDateAllowed', 'pastDatesAllowedDays');
    });

    this.leavePolicyForm?.get('carryForwardAllowed')?.valueChanges.subscribe((value: any) => {
      this.updateDependentFieldState('carryForwardAllowed', 'carryForwardAllowedValue');
    });

    this.leavePolicyForm?.get('encashAllowedType')?.valueChanges.subscribe((value: any) => {
      this.updateDependentFieldState('encashAllowedType', 'encashAllowedValue');
    });

    this.leavePolicyForm?.get('noticeperiodAllowedType')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('noticePeriodAllowedValue');
      const typeControl = this.leavePolicyForm.get('noticePeriodFrequencyType');
      const extendControl = this.leavePolicyForm.get('extendLastWorkingDay');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(0.5)]);
        typeControl?.enable();
        typeControl?.setValidators([Validators.required]);
        extendControl?.enable();
        extendControl?.setValidators([Validators.required]);
      } else {
        daysControl?.disable();
        daysControl?.clearValidators();
        daysControl?.setValue(0);
        typeControl?.disable();
        typeControl?.clearValidators();
        typeControl?.setValue(null);
        extendControl?.clearValidators();
        extendControl?.setValue(null);
      }
      daysControl?.updateValueAndValidity();
      typeControl?.updateValueAndValidity();
      extendControl?.updateValueAndValidity();
    });

    this.leavePolicyForm?.get('isProbationAllowed')?.valueChanges.subscribe((value: any) => {
      const daysControl = this.leavePolicyForm.get('probationDays');
      const typeControl = this.leavePolicyForm.get('probationFrequencyType');
      if (value) {
        daysControl?.enable();
        daysControl?.setValidators([Validators.required, Validators.min(0.5)]);
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

      if (value === false) {
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
    this.leavePolicyForm?.get('entitlementFrequency')?.valueChanges.subscribe((value: any) => {
      const cycleCtrl = this.leavePolicyForm.get('entitlementCycleHandling');
      const pastCycleCtrl = this.leavePolicyForm.get('allowPastCycleApplication');
      if (value === 'YEARLY') {
        cycleCtrl?.clearValidators();
        cycleCtrl?.setValue(null);
        pastCycleCtrl?.clearValidators();
        pastCycleCtrl?.setValue(null);
      } else {
        cycleCtrl?.setValidators([Validators.required]);
        pastCycleCtrl?.setValidators([Validators.required]);
      }
      cycleCtrl?.updateValueAndValidity();
      pastCycleCtrl?.updateValueAndValidity();
    });

    // Update published categories when location/sublocation/year/shift changes
    this.leavePolicyForm?.get('applicableYear')?.valueChanges.subscribe(() => this.updatePublishedCategories());
    this.leavePolicyForm?.get('locationID')?.valueChanges.subscribe(() => this.updatePublishedCategories());
    this.leavePolicyForm?.get('subLocation')?.valueChanges.subscribe(() => this.updatePublishedCategories());
    this.leavePolicyForm?.get('shiftId')?.valueChanges.subscribe(() => this.updatePublishedCategories());

    this.leavePolicyForm?.get('enableSandwichPolicy')?.valueChanges.subscribe((value: any) => {
      const applySandwichOnControl = this.leavePolicyForm.get('applySandwichOn');
      const sandwichCalculationBasisControl = this.leavePolicyForm.get('sandwichCalculationBasis');
      const sandwichApplicabilityConditionControl = this.leavePolicyForm.get('sandwichApplicabilityCondition');
      const adjacentLeaveTypeRuleControl = this.leavePolicyForm.get('adjacentLeaveTypeRule');

      if (value === true) {
        applySandwichOnControl?.setValidators([Validators.required]);
        sandwichCalculationBasisControl?.setValidators([Validators.required]);
        sandwichApplicabilityConditionControl?.setValidators([Validators.required]);
        adjacentLeaveTypeRuleControl?.setValidators([Validators.required]);
      } else {
        applySandwichOnControl?.clearValidators();
        sandwichCalculationBasisControl?.clearValidators();
        sandwichApplicabilityConditionControl?.clearValidators();
        adjacentLeaveTypeRuleControl?.clearValidators();
        applySandwichOnControl?.setValue(null);
        sandwichCalculationBasisControl?.setValue(null);
        sandwichApplicabilityConditionControl?.setValue(null);
        adjacentLeaveTypeRuleControl?.setValue(null);
        applySandwichOnControl?.markAsUntouched();
        sandwichCalculationBasisControl?.markAsUntouched();
        sandwichApplicabilityConditionControl?.markAsUntouched();
        adjacentLeaveTypeRuleControl?.markAsUntouched();
      }
      applySandwichOnControl?.updateValueAndValidity();
      sandwichCalculationBasisControl?.updateValueAndValidity();
      sandwichApplicabilityConditionControl?.updateValueAndValidity();
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

    // Initial check for sandwichCalculationBasis
    if (this.leavePolicyForm.get('sandwichCalculationBasis')?.value === 'start_date/end_date') {
      const sandwichApplicabilityConditionControl = this.leavePolicyForm.get('sandwichApplicabilityCondition');
      sandwichApplicabilityConditionControl?.setValue('leave_on_both_sides_of_holiday/weekend');
      sandwichApplicabilityConditionControl?.disable();
    }
    this.leavePolicyForm?.get('minimumGapBetweenSameLeaveType')?.valueChanges.subscribe(() => {
      this.syncGapCalculationBasis();
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
  }

  private syncGapCalculationBasis() {
    const minGapRaw = this.leavePolicyForm.get('minimumGapBetweenSameLeaveType')?.value;
    const minGap = typeof minGapRaw === 'string' ? Number(minGapRaw) : minGapRaw;
    const gapCalculationBasisControl = this.leavePolicyForm.get('gapCalculationBasis');

    if (!gapCalculationBasisControl) return;

    if (minGap && minGap > 0) {
      gapCalculationBasisControl.setValidators([Validators.required]);
    } else {
      gapCalculationBasisControl.clearValidators();
      gapCalculationBasisControl.setValue(null, { emitEvent: false });
    }

    gapCalculationBasisControl.updateValueAndValidity();
  }

  updatePublishedCategories() {
    const year = this.leavePolicyForm.get('applicableYear')?.value;
    const locationId = this.leavePolicyForm.get('locationID')?.value?.id || this.leavePolicyForm.get('locationID')?.value;
    const sublocationId = this.leavePolicyForm.get('subLocation')?.value?.id || this.leavePolicyForm.get('subLocation')?.value;
    const shiftId = this.leavePolicyForm.get('shiftId')?.value;

    if (year && locationId && sublocationId && shiftId) {
      this.getOrgLeavesCategories(locationId, sublocationId, year, shiftId);
    }
  }
  navigate() {
    this.router.navigate([
      '/settings/timeoff-configurations/leave-categoery/pendingleavecategory',
    ]);
  }
  getSubLocationByid(locationID: any) {
    let sublocid = locationID ?? this.updateLeaveCategoryData.locationID;
    this.subscription = this.http
      .getData(`JobLocation/sub-location-by-joblocation/${sublocid}`)
      .subscribe({
        next: (data: any) => {
          this.subLocationsDropdown = data.jobSubLocations;
          this.leavePolicyForm.patchValue({
            subLocation: this.subLocationsDropdown.find(
              (x: any) =>
                x.jobSubLocationName ===
                this.updateLeaveCategoryData.subLocationName
            ),
          });
          this.subloactionid();
          let locsublocid = {
            jobLocationId: this.updateLeaveCategoryData.locationID,
            id: this.updateLeaveCategoryData.subLocation,
          };
          this.getShiftBYid(locsublocid);
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
            this.leavePolicyForm.patchValue({
              shiftId: this.shiftsArray.find(
                (x: any) => x.label === this.updateLeaveCategoryData.shiftName
              ).value,
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
        this.patchFormValues(this.updateLeaveCategoryData);
      },
      error: (err) => {
        console.error('Error fetching leave types:', err);
        this.leaveTypes = [];
        this.patchFormValues(this.updateLeaveCategoryData);
      }
    });
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
          daysControl?.setValue(0);
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
          daysControl?.setValue(0);
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
          daysControl?.setValue(0);
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
          daysControl?.setValue(0);
        }
        daysControl?.updateValueAndValidity();
      });

    this.leavePolicyForm
      .get('noticeperiodAllowedType')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get(
          'noticePeriodAllowedValue'
        );
        const typeControl = this.leavePolicyForm.get('noticePeriodFrequencyType');
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(0.5)]);
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

    this.leavePolicyForm
      .get('isProbationAllowed')
      ?.valueChanges.subscribe((value: any) => {
        const daysControl = this.leavePolicyForm.get('probationDays');
        const typeControl = this.leavePolicyForm.get('probationFrequencyType');
        if (value) {
          daysControl?.enable();
          daysControl?.setValidators([Validators.required, Validators.min(0.5)]);
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
    console.log('Patching form with data:', data);
    this.getOrgLeavesCategories(data.locationID, data.subLocation, data.applicableYear, data.shiftId);
    this.leavePolicyForm.patchValue({
      applicableYear: data.applicableYear,
      locationID: data.locationID,
      subLocation: data.subLocationName,
      shiftId: data.shiftId,
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
      sandwichApplicabilityCondition: data.sandwichApplicabilityCondition,
      adjacentLeaveTypeRule: data.adjacentLeaveTypeRule,
      extendLastWorkingDay:data.isNoticePeriodExtended,
      entitlementFrequency: data.entitlementFrequency,
      entitlementCycleHandling: data.entitlementCycleHandling,
      allowPastCycleApplication: data.allowPastCycleApplication,
    });
    this.syncGapCalculationBasis();
    
    // Force update leaveType after a delay to ensure dropdown is ready
    // setTimeout(() => {
    //   this.leavePolicyForm.get('leaveType')?.setValue(leaveTypeValue);
    // }, 100);
    // Manually trigger value changes for dependent fields
    // Manually trigger the initial state for dependent fields
    this.updateDependentFieldState('futureDatesAllowed', 'futureDatesAllowedDays');
    this.updateDependentFieldState('pastDateAllowed', 'pastDatesAllowedDays');
    this.updateDependentFieldState('carryForwardAllowed', 'carryForwardAllowedValue');
    this.updateDependentFieldState('encashAllowedType', 'encashAllowedValue');
    this.updateDependentFieldState('noticeperiodAllowedType', 'noticePeriodAllowedValue');
    this.updateDependentFieldState('isProbationAllowed', 'probationDays');

    this.setupDependentFieldListenerS();
    this.setupDependentFieldListeners();
    this.validateAllowedDays();
    this.leavePolicyForm.markAsPristine();
  }


  validateAllowedDays() {
    this.setupMaxValidation('futureDatesAllowedDays', 'validity');
    this.setupMaxValidation('pastDatesAllowedDays', 'validity');
    this.setupMaxValidation('carryForwardAllowedValue', 'validity');
    this.setupMaxValidation('encashAllowedValue', 'validity');
    this.setupMaxValidation('noticePeriodAllowedValue', 'validity');
    this.setupMaxValidation('noticePeriodAllowedValue', 'validity');
    this.setupMaxValidation('probationDays', 'validity');
     this.setupMaxValidation('extendLastWorkingDay', 'validity');
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
    let sanitizedValue = inputElement.value.replace(/[^0-9]/g, '');
    
    // Set the sanitized value back to the input
    inputElement.value = sanitizedValue;
    
    // Update the form control value only if the value contains digits
    if (/^\d*$/.test(sanitizedValue)) {
      this.leavePolicyForm.get(fieldName)?.setValue(sanitizedValue);
    }
  }

  // Form submission
  onSubmit() {
    const formData = this.leavePolicyForm.getRawValue();
    console.log('Form Data:', formData);
    let payload = {
      id: this.updateLeaveCategoryData.id,
      applicableYear:
        formData.applicableYear ??
        this.updateLeaveCategoryData.applicableYear,
      locationID:
        formData.locationID.id ??
        this.updateLeaveCategoryData.locationID,
      subLocation:
        formData.subLocation.id ??
        this.updateLeaveCategoryData.subLocation,
      shiftId:
        formData.shiftId ??
        this.updateLeaveCategoryData.shiftId,
      type:
        formData.type ?? this.updateLeaveCategoryData.type,
      leaveTypeId: formData.leaveType,
      name:
        formData.name ?? this.updateLeaveCategoryData.name,
      categoryCode:
        formData.categoryCode ??
        this.updateLeaveCategoryData.categoryCode,
      validity:
        formData.validity ??
        this.updateLeaveCategoryData.validity,
      categoryColor:
        formData.categoryColor ??
        this.updateLeaveCategoryData.parentId,
      parentId:
        formData.parentId ??
        this.updateLeaveCategoryData.applicableYear,
      allowedGender:
        formData.allowedGender ??
        this.updateLeaveCategoryData.allowedGender,
      allowedMaritalStatus:
        formData.allowedMaritalStatus ??
        this.updateLeaveCategoryData.allowedMaritalStatus,
      excludeWeekends:
        formData.excludeWeekends ??
        this.updateLeaveCategoryData.excludeWeekends,
      excludeHolidays:
        formData.excludeHolidays ??
        this.updateLeaveCategoryData.excludeHolidays,
      isOptionalHoliday:
        formData.isOptionalHoliday ??
        this.updateLeaveCategoryData.isOptionalHoliday,
      allowedHalfDay:
        formData.allowedHalfDay ??
        this.updateLeaveCategoryData.allowedHalfDay,
      isApplicableProRataLeave:
        formData.isApplicableProRataLeave ??
        this.updateLeaveCategoryData.isApplicableProRataLeave,
      futureDatesAllowed:
        formData.futureDatesAllowed ??
        this.updateLeaveCategoryData.futureDatesAllowed,
      futureDatesAllowedDays:
        formData.futureDatesAllowedDays ?? 0,
      pastDateAllowed:
        formData.pastDateAllowed ??
        this.updateLeaveCategoryData.pastDateAllowed,
      pastDatesAllowedDays:
        formData.pastDatesAllowedDays ?? 0,
      carryForwardAllowed:
        formData.carryForwardAllowed ??
        this.updateLeaveCategoryData.carryForwardAllowed,
      carryForwardAllowedValue:
        formData.carryForwardAllowedValue ?? 0,
      encashAllowedType:
        formData.encashAllowedType ??
        this.updateLeaveCategoryData.encashAllowedType,
      encashAllowedValue: formData.encashAllowedValue ?? 0,
      noticeperiodAllowedType:
        formData.noticeperiodAllowedType ??
        this.updateLeaveCategoryData.noticeperiodAllowedType,
      noticePeriodAllowedValue:
        formData.noticePeriodAllowedValue ?? 0,
      noticePeriodFrequencyType: formData.noticePeriodFrequencyType,
      isProbationAllowed:
        formData.isProbationAllowed ??
        this.updateLeaveCategoryData.isProbationAllowed,
      probationDays: formData.probationDays ?? 0,
      probationFrequencyType: formData.probationFrequencyType,
      // New Leave Category Fields
      minimumAdvanceApplyDays: formData.minimumAdvanceApplyDays || null,
      maxLeaveDurationCalendarDays: formData.maxLeaveDurationCalendarDays || null,
      includeWeekends: formData.includeWeekends,
      includeHolidays: formData.includeHolidays,
      allowLeaveCombination: formData.allowLeaveCombination,
      restrictedAdjacentLeaveTypes: formData.restrictedAdjacentLeaveTypes?.join(','),
      blockLeaveOnWeekends: formData.blockLeaveOnWeekends,
      blockPreviousDayLeave: formData.blockPreviousDayLeave,
      blockNextDayLeave: formData.blockNextDayLeave,
      minimumGapBetweenSameLeaveType: formData.minimumGapBetweenSameLeaveType || null,
      gapCalculationBasis: formData.gapCalculationBasis,
      enableSandwichPolicy: formData.enableSandwichPolicy,
      applySandwichOn: formData.applySandwichOn,
      sandwichCalculationBasis: formData.sandwichCalculationBasis,
      sandwichApplicabilityCondition: formData.sandwichApplicabilityCondition,
      adjacentLeaveTypeRule: formData.adjacentLeaveTypeRule,
      entitlementFrequency: formData.entitlementFrequency,
      entitlementCycleHandling: formData.entitlementCycleHandling,
      allowPastCycleApplication: formData.allowPastCycleApplication,
      // addedBy: this.empinfo.employeeId,
      lastModifiedBy: this.empinfo.employeeId,
      status: this.updateLeaveCategoryData.status,
      addedDate: this.updateLeaveCategoryData.addedDate,
      lastModifiedDate: new Date(),
      isNoticePeriodExtended:formData.extendLastWorkingDay
    };
    this.subscription = this.http
      .postdata('OrgLeavesCategories/UPDATER', payload)
      .subscribe({
        next: (data: any) => {
          this.confirmation.openSuccessModal(
            'Leave Category updated successfully'
          );
          this.router.navigate([
            '/settings/timeoff-configurations/leave-categoery/pendingleavecategory',
          ]);
          this.leavePolicyForm.reset();
          this.leavePolicyForm.markAsPristine();
        },
        error: (err: any) => {
          this.confirmation.openErrorModal(err.error.message);
        },
      });
  }

  onPublished() {
    const formData = this.leavePolicyForm.getRawValue();
    
    console.log('Form Data:', formData);
    let payload = {
      id: this.updateLeaveCategoryData.id,
      applicableYear:
        formData.applicableYear ??
        this.updateLeaveCategoryData.applicableYear,
      locationID:
        formData.locationID.id ??
        this.updateLeaveCategoryData.locationID,
      subLocation:
        formData.subLocation.id ??
        this.updateLeaveCategoryData.subLocation,
      shiftId:
        formData.shiftId ??
        this.updateLeaveCategoryData.shiftId,
      type:
        formData.type ?? this.updateLeaveCategoryData.type,
      leaveType:
        formData.leaveType ?? this.updateLeaveCategoryData.leaveType,
      leaveTypeId: formData.leaveType,
      name:
        formData.name ?? this.updateLeaveCategoryData.name,
      categoryCode:
        formData.categoryCode ??
        this.updateLeaveCategoryData.categoryCode,
      validity:
        formData.validity ??
        this.updateLeaveCategoryData.validity,
      categoryColor:
        formData.categoryColor ??
        this.updateLeaveCategoryData.parentId,
      parentId:
        formData.parentId ??
        this.updateLeaveCategoryData.applicableYear,
      allowedGender:
        formData.allowedGender ??
        this.updateLeaveCategoryData.allowedGender,
      allowedMaritalStatus:
        formData.allowedMaritalStatus ??
        this.updateLeaveCategoryData.allowedMaritalStatus,
      excludeWeekends:
        formData.excludeWeekends ??
        this.updateLeaveCategoryData.excludeWeekends,
      excludeHolidays:
        formData.excludeHolidays ??
        this.updateLeaveCategoryData.excludeHolidays,
      isOptionalHoliday:
        formData.isOptionalHoliday ??
        this.updateLeaveCategoryData.isOptionalHoliday,
      allowedHalfDay:
        formData.allowedHalfDay ??
        this.updateLeaveCategoryData.allowedHalfDay,
      isApplicableProRataLeave:
        formData.isApplicableProRataLeave ??
        this.updateLeaveCategoryData.isApplicableProRataLeave,
      futureDatesAllowed:
        formData.futureDatesAllowed ??
        this.updateLeaveCategoryData.futureDatesAllowed,
      futureDatesAllowedDays:
        formData.futureDatesAllowedDays ?? 0,
      pastDateAllowed:
        formData.pastDateAllowed ??
        this.updateLeaveCategoryData.pastDateAllowed,
      pastDatesAllowedDays:
        formData.pastDatesAllowedDays ?? 0,
      carryForwardAllowed:
        formData.carryForwardAllowed ??
        this.updateLeaveCategoryData.carryForwardAllowed,
      carryForwardAllowedValue:
        formData.carryForwardAllowedValue ?? 0,
      encashAllowedType:
        formData.encashAllowedType ??
        this.updateLeaveCategoryData.encashAllowedType,
      encashAllowedValue: formData.encashAllowedValue ?? 0,
      noticeperiodAllowedType:
        formData.noticeperiodAllowedType ??
        this.updateLeaveCategoryData.noticeperiodAllowedType,
      noticePeriodAllowedValue:
        formData.noticePeriodAllowedValue ?? 0,
      noticePeriodFrequencyType: formData.noticePeriodFrequencyType,
      isProbationAllowed:
        formData.isProbationAllowed ??
        this.updateLeaveCategoryData.isProbationAllowed,
      probationDays: formData.probationDays ?? 0,
      probationFrequencyType: formData.probationFrequencyType,
      // New Leave Category Fields
      minimumAdvanceApplyDays: formData.minimumAdvanceApplyDays || null,
      maxLeaveDurationCalendarDays: formData.maxLeaveDurationCalendarDays || null,
      includeWeekends: formData.includeWeekends,
      includeHolidays: formData.includeHolidays,
      allowLeaveCombination: formData.allowLeaveCombination,
      restrictedAdjacentLeaveTypes: formData.restrictedAdjacentLeaveTypes?.join(','),
      blockLeaveOnWeekends: formData.blockLeaveOnWeekends,
      blockPreviousDayLeave: formData.blockPreviousDayLeave,
      blockNextDayLeave: formData.blockNextDayLeave,
      minimumGapBetweenSameLeaveType: formData.minimumGapBetweenSameLeaveType || null,
      gapCalculationBasis: formData.gapCalculationBasis,
      enableSandwichPolicy: formData.enableSandwichPolicy,
      applySandwichOn: formData.applySandwichOn,
      sandwichCalculationBasis: formData.sandwichCalculationBasis,
      sandwichApplicabilityCondition: formData.sandwichApplicabilityCondition,
      adjacentLeaveTypeRule: formData.adjacentLeaveTypeRule,
      entitlementFrequency: formData.entitlementFrequency,
      entitlementCycleHandling: formData.entitlementCycleHandling,
      allowPastCycleApplication: formData.allowPastCycleApplication,
      // addedBy: this.empinfo.employeeId,
      lastModifiedBy: this.empinfo.employeeId,
      status: 'Published',
      addedDate: this.updateLeaveCategoryData.addedDate,
      lastModifiedDate: new Date(),
    };
    this.http.postdata('OrgLeavesCategories/UPDATER', payload).subscribe({
      next: (data: any) => {
        this.confirmation.openSuccessModal(
          'Leave Category published successfully'
        );
        this.router.navigate([
          '/settings/timeoff-configurations/leave-categoery/publishedleavecategory',
        ]);
        this.leavePolicyForm.reset();
      },
      error: (err: any) => {
        this.confirmation.openErrorModal(err.error.message);
      },
    });
  }

  navigateToCloneLeaveCategory() {
    const formValues = this.leavePolicyForm.getRawValue();
    const dataToClone = {
      ...this.updateLeaveCategoryData,
      enableSandwichPolicy: formValues.enableSandwichPolicy,
      applySandwichOn: formValues.applySandwichOn,
      sandwichCalculationBasis: formValues.sandwichCalculationBasis,
      sandwichApplicabilityCondition: formValues.sandwichApplicabilityCondition,
      adjacentLeaveTypeRule: formValues.adjacentLeaveTypeRule
    };

    localStorage.setItem(
      'cloneleavecategory',
      JSON.stringify(dataToClone)
    );
    this.router.navigate([
      '/settings/timeoff-configurations/cloneleavecategory',
    ]);
  }

  resetForm(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cancel() {
    this.router.navigate([
      '/settings/timeoff-configurations/leave-categoery/pendingleavecategory',
    ]);
    this.leavePolicyForm.reset();
  }

  closepopup() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
