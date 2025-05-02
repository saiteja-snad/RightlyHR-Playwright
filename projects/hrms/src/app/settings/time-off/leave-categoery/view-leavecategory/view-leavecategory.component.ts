import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { Iorgcategoryleaves, ShiftData } from '../../../../Interfaces/timoff-model';

@Component({
  selector: 'app-view-leavecategory',
  imports: [CommonModule,Select,ReactiveFormsModule],
  templateUrl: './view-leavecategory.component.html',
  styleUrl: './view-leavecategory.component.scss'
})
export class ViewLeavecategoryComponent {
  leavePolicyForm: FormGroup;
  subscription!: Subscription;
  years: { label: string; value: number }[] = [];
  jobLocationDropDownData: any[] = [];
  subLocationsDropdown: any[] = [];
  shiftDropdown: ShiftData[] = [];
  publishedCategories: any[] = [];
  postOrgPloicyDetailsArray: [] = [];
  leaveCategoryType: any[] = [
    {label : 'General', value : 1},
    {label : 'Flexible', value : 0}
  ];
  genderDetails: any[] = [
    {label : 'All', value : 0},
    {label : 'Male', value : 1},
    {label : 'Female', value : 2},
  ];
  marriedDetails: any[] = [
    {label : 'All', value : 0},
    {label : 'Married', value : 1},
    {label : 'Unmarried', value : 2},
  ];

  global: any[] = [
    {label : 'Yes', value : true},
    {label : 'No', value : false}
  ];
 shiftsArray =  [ ] as any [];
 updatecloneLeaveCategoryData = {} as Iorgcategoryleaves;


  constructor(private fb: FormBuilder,private http: HttpService,private confirmation: OpenModalService,private router: Router) {
    

    this.leavePolicyForm = this.fb.group({
      // Location/Shift Section
      applicableYear: [{ value: undefined, disabled: true }, Validators.required],
      locationID: [{ value: undefined, disabled: true }, Validators.required],
      subLocation: [{ value: undefined, disabled: true }, Validators.required],
      shiftId: [{ value: undefined, disabled: true }, Validators.required],
      // Leave Category Information
      type: [{ value: undefined, disabled: true }, Validators.required],
      name: [{ value: '', disabled: true }, [Validators.required, this.restrictInputValidator]],
      categoryCode: [{ value: '', disabled: true }, [Validators.required, this.restrictInputLeavecodeValidator]],
      validity: [{ value: '', disabled: true }, [Validators.required, this.restrictInputNumbersValidator]],
      categoryColor: [{ value: '#000000', disabled: true }, Validators.required],
      parentId: [{ value: undefined, disabled: true }],
      // Additional Information
      allowedGender: [{ value: undefined, disabled: true }, Validators.required],
      allowedMaritalStatus: [{ value: undefined, disabled: true }, Validators.required],
      excludeWeekends: [{ value: undefined, disabled: true }, Validators.required],
      excludeHolidays: [{ value: undefined, disabled: true }, Validators.required],
      isOptionalHoliday: [{ value: undefined, disabled: true }, Validators.required],
      allowedHalfDay: [{ value: undefined, disabled: true }, Validators.required],
      isApplicableProRataLeave: [{ value: undefined, disabled: true }, Validators.required],
      // Future Dates
      futureDatesAllowed: [{ value: undefined, disabled: true }, Validators.required],
      futureDatesAllowedDays: [{ value: undefined, disabled: true }, [this.dependentRequiredValidator('futureDatesAllowed')]],
      // Past Dates
      pastDateAllowed: [{ value: undefined, disabled: true }, Validators.required],
      pastDatesAllowedDays: [{ value: undefined, disabled: true }, [this.dependentRequiredValidator('pastDateAllowed')]],
      // Carry Forward
      carryForwardAllowed: [{ value: undefined, disabled: true }, Validators.required],
      carryForwardAllowedValue: [{ value: undefined, disabled: true }, [this.dependentRequiredValidator('carryForwardAllowed')]],
      // Encash
      encashAllowedType: [{ value: undefined, disabled: true }, Validators.required],
      encashAllowedValue: [{ value: undefined, disabled: true }, [this.dependentRequiredValidator('encashAllowedType')]],
      // Notice Period
      noticeperiodAllowedType: [{ value: undefined, disabled: true }, Validators.required],
      noticePeriodAllowedValue: [{ value: undefined, disabled: true }, [this.dependentRequiredValidator('noticeperiodAllowedType')]],
      // Probation Period
      isProbationAllowed: [{ value: undefined, disabled: true }, Validators.required],
      probationDays: [{ value: undefined, disabled: true }, [this.dependentRequiredValidator('isProbationAllowed')]]
    });
    
    
  }

  ngOnInit(): void {
    this.updatecloneLeaveCategoryData = JSON.parse(localStorage.getItem('viewleavecategory') ?? '{}');
    this.patchFormValues(this.updatecloneLeaveCategoryData);
    console.log(this.updatecloneLeaveCategoryData);
    this.getparentIdLC(this.updatecloneLeaveCategoryData.parentId,this.updatecloneLeaveCategoryData.parentId)
    this.setupDependentFieldListeners();
    this.jobLocationList();
    this.getOrgLeavesCategories();
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push({ label: year.toString(), value: year });
    }
  }

  navigate(){
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/publishedleavecategory']);
  }
  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
        
      }
    })
  } 
  OnClickLocation(id :any) {
    const locationID = id;
    console.log(locationID);
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
      const sublocationId = this.subLocationsDropdown.find((c: any) => parseInt(c.id) === parseInt(id));
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

  getOrgLeavesCategories() {
      this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
        next: (responseData: any) => {
          this, responseData.orgcategory
          console.log(responseData);
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
    this.leavePolicyForm.get('futureDatesAllowed')?.valueChanges.subscribe((value :any) => {
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

    this.leavePolicyForm.get('pastDateAllowed')?.valueChanges.subscribe((value :any) => {
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
    this.leavePolicyForm.get('carryForwardAllowed')?.valueChanges.subscribe((value :any) => {
      const daysControl = this.leavePolicyForm.get('carryForwardAllowedValue');
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

    this.leavePolicyForm.get('encashAllowedType')?.valueChanges.subscribe((value :any) => {
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

    this.leavePolicyForm.get('noticeperiodAllowedType')?.valueChanges.subscribe((value :any) => {
      const daysControl = this.leavePolicyForm.get('noticePeriodAllowedValue');
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

    this.leavePolicyForm.get('isProbationAllowed')?.valueChanges.subscribe((value :any) => {
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

  parentIdData = {} as any;
  getparentIdLC(id: any,parentid : any) {
    if (id) {
      this.subscription = this.http.getData(`OrgLeavesCategories/${id}?CategoryId=${parentid}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.parentIdData = data;
          this.leavePolicyForm.patchValue({
            parentId : this.parentIdData.name,
          });
          
        }
      })
    } else {
    }
  }

 

  // Patch form values (for edit mode)
  patchFormValues(data: any) {
    this.leavePolicyForm.patchValue({
      applicableYear: data.applicableYear,
      locationID: data.locationName,
      subLocation: data.subLocationName,
      shiftId: data.shiftName,
      type: data.type,
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
      isProbationAllowed: data.isProbationAllowed,
      probationDays: data.probationDays
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
      isProbationAllowed: this.leavePolicyForm.value.isProbationAllowed,
      probationDays: this.leavePolicyForm.value.probationDays ?? 0,
      addedBy: 3356,
      lastModifiedBy: 3356,
      status :"Pending for submission",
      addedDate : new Date(),
      lastModifiedDate : new Date()
    };

    this.http.postdata('OrgLeavesCategories', payload).subscribe({
      next: (data: any) => {
        this.confirmation.openSuccessModal('Leave Category added successfully');
        this.router.navigate(['/settings/employee-fields/manage-leave-categories/pending-for-submit']);
        this.resetForm();
      },
      error: (err: any) => {
        this.confirmation.openErrorModal(err.error.message);
      }
    });
  }
  resetForm() {
    this.leavePolicyForm.reset();
  }
}
