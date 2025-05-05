import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { Iorgcategoryleaves, ShiftData } from '../../../../Interfaces/timoff-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-clone-leavecategory',
  imports: [CommonModule,Select,ReactiveFormsModule],
  templateUrl: './clone-leavecategory.component.html',
  styleUrl: './clone-leavecategory.component.scss'
})
export class CloneLeavecategoryComponent {
  
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


  constructor(private fb: FormBuilder,private http: HttpService,private confirmation: OpenModalService,private router: Router,private modalService: NgbModal) {
    

    this.leavePolicyForm = this.fb.group({
      // Location/Shift Section
      applicableYear: [undefined, Validators.required],
      locationID: [undefined, Validators.required],
      subLocation: [undefined, Validators.required],
      shiftId: [undefined, Validators.required],
      // Leave Category Information
      type: [undefined, Validators.required],
      name: ['', [Validators.required, this.restrictInputValidator]],
      categoryCode: ['', [Validators.required, this.restrictInputLeavecodeValidator]],
      validity: ['', [Validators.required, this.restrictInputNumbersValidator]],
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
      futureDatesAllowedDays: [undefined, [this.dependentRequiredValidator('futureDatesAllowed')]],
      // Past Dates
      pastDateAllowed: [undefined, Validators.required],
      pastDatesAllowedDays: [undefined, [this.dependentRequiredValidator('pastDateAllowed')]],
      // Carry Forward
      carryForwardAllowed: [undefined, Validators.required],
      carryForwardAllowedValue: [undefined, [this.dependentRequiredValidator('carryForwardAllowed')]],
      // Encash
      encashAllowedType: [undefined, Validators.required],
      encashAllowedValue: [undefined, [this.dependentRequiredValidator('encashAllowedType')]],
      // Notice Period
      noticeperiodAllowedType: [undefined, Validators.required],
      noticePeriodAllowedValue: [undefined, [this.dependentRequiredValidator('noticeperiodAllowedType')]],
      // Probation Period
      isProbationAllowed: [undefined, Validators.required],
      probationDays: [undefined, [this.dependentRequiredValidator('isProbationAllowed')]]
    });
    
  }

  ngOnInit(): void {
    this.updatecloneLeaveCategoryData = JSON.parse(localStorage.getItem('cloneleavecategory') ?? '{}');
    this.patchFormValues(this.updatecloneLeaveCategoryData);
    console.log(this.updatecloneLeaveCategoryData);
    this.setupDependentFieldListeners();
    this.jobLocationList();
    this.getOrgLeavesCategories();
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push({ label: year.toString(), value: year });
    }
  }

  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
        this.leavePolicyForm.patchValue({
          locationID: this.jobLocationDropDownData.find((x: any) => x.jobLocationName === this.updatecloneLeaveCategoryData.locationName),
        });
        this.getSubLocationByid(this.updatecloneLeaveCategoryData.locationID)
      }
    })
  } 
  OnClickLocation(id :any) {
    const locationID = id;
    console.log(locationID);
    this.getSubLocationByid(locationID);
  }
  getSubLocationByid(locationID: any) {
    let sublocid = locationID ?? this.updatecloneLeaveCategoryData.locationID
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${sublocid}`).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
        this.leavePolicyForm.patchValue({
          subLocation: this.subLocationsDropdown.find((x: any) => x.jobSubLocationName === this.updatecloneLeaveCategoryData.subLocationName),
        });
        this.subloactionid();
        let locsublocid = {
          jobLocationId: this.updatecloneLeaveCategoryData.locationID,
          id: this.updatecloneLeaveCategoryData.subLocation
        }
        this.getShiftBYid(locsublocid)
      }
    })
  }
  navigate(){
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/publishedleavecategory'])
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
          this.leavePolicyForm.patchValue({
            shiftId: this.shiftsArray.find((x: any) => x.label === this.updatecloneLeaveCategoryData.shiftName).value,
          });
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


 

  // Patch form values (for edit mode)
  patchFormValues(data: any) {
    this.leavePolicyForm.patchValue({
      applicableYear: data.applicableYear,
      locationID: data.locationID,
      subLocation: data.subLocation,
      shiftId: data.shiftId,
      type: data.type,
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
        this.leavePolicyForm.reset();
      },
      error: (err: any) => {
        this.confirmation.openErrorModal(err.error.message);
      }
    });
  }
  resetForm(content:any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
    this.leavePolicyForm.reset();
  }
  cancel(){
    this.router.navigate(['/settings/timeoff-configurations/leave-categoery/publishedleavecategory']);
  }
  closepopup(){
    this.modalService.dismissAll();
  }
}
