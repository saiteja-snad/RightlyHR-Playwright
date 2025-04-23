import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create',
  imports: [CommonModule, FormsModule, NgbPopoverModule, ReactiveFormsModule, Select, TranslateModule, MultiSelectModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  subscription!: Subscription;
  reviewCyclesList: any;
  reviewCycleForm!: FormGroup;
  jobLocationDropDownData: any;
  subLocationsDropdown: any;
  departmentDetails: any;
  subDepartmentsDropdownValues: any;
  listofReviewTemplates: any;
  ReviewCycleTypes: any;
  status: any;
  isLoading: boolean = false;
  @Output() onClickNoCancelPopUp = new EventEmitter<void>();
  @ViewChild('cancelationConfirmation') cancelationConfirmation: any;
  todayDate = new Date().toISOString().split('T')[0]

  constructor(
    public readonly modalService: NgbModal,
    private readonly http: HttpService,
    private readonly fb: FormBuilder, private conformationPopup: OpenModalService,
  ) { }

  ngOnInit(): void {
    this.initializeReviewCycleForm();
    this.getAllDepartments();
    this.getAllLocations();
    this.getAllDepartments();
    this.getAllReviewCycleTypes();
  }


  close() {
    this.modalService.dismissAll();
  }

  openCancelationPopUp() {
    this.modalService.open(this.cancelationConfirmation, { centered: true });
  }

  initializeReviewCycleForm() {
    this.reviewCycleForm = this.fb.group(
      {
        reviewCycleName: ['', [Validators.required, Validators.maxLength(50), this.noWhitespaceValidator()]],
        startDate: ['', Validators.required],
        endDate: [{ value: '', disabled: true }, Validators.required],
        dueDate: [{ value: '', disabled: true }, [this.dueDateAfterStartDateValidator('startDate')]],
        reviewCycleType: [null, Validators.required],
        applicableForIncrement: [false],
        locationId: [null, Validators.required],
        subLocationId: [null, Validators.required],
        departmentId: [null, Validators.required],
        subDepartmentId: [null, Validators.required],
        applicableEmployeesJoinedBefore: [null, Validators.required],
        description: [null, [Validators.maxLength(250), this.noWhitespaceValidatordescrition()]],
      },
      { validators: [this.startDateEndDateValidator(), this.joinDateEndDateValidator()] }
    );

    this.reviewCycleForm.get('startDate')?.valueChanges.subscribe(() => {
      this.toggleDateFields();
      this.reviewCycleForm.updateValueAndValidity();
    });

    this.toggleDateFields();
  }

  dueDateAfterStartDateValidator(startDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent; // Get the parent form group
      if (!formGroup) return null;
      const startDate = formGroup.get(startDateControlName)?.value;
      const dueDate = control.value;
      if (startDate && dueDate) {
        const start = new Date(startDate);
        const due = new Date(dueDate);
        if (due < start) {
          return { dueDateBeforeStartDate: true };
        }
        if (start.getTime() === due.getTime()) {
          return { startDateEqualsDueDate: true };
        }
      }
      return null;
    };
  }

  startDateEndDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        return { endDateInvalid: true };
      }
      return null;
    };
  }

  joinDateEndDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const joinDate = control.get('applicableEmployeesJoinedBefore')?.value;
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;

      if (joinDate && startDate && endDate) {
        const join = new Date(joinDate);
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (join <= start || join >= end) {
          return { joinDateInvalid: true };
        }
      }

      return null;
    };
  }

  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').trim(); // Trim leading/trailing spaces
      const startsWithInvalidChar = /^[^a-zA-Z0-9]/.test(value); // Checks for non-alphanumeric character at the start
      const isEmptyAfterTrim = value === ''; // Check if only spaces were entered
      const isValid = !startsWithInvalidChar && !isEmptyAfterTrim;

      return isValid ? null : { invalidStart: true };
    };
  }

  noWhitespaceValidatordescrition(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const isWhitespace = value.trim().length === 0 && value.length > 0;
      const isValid = !isWhitespace;
      return isValid ? null : { whitedespritionspace: true };
    };
  }
  toggleDateFields(): void {
    const startDateControl = this.reviewCycleForm.get('startDate');
    const startDateValid = !!startDateControl?.value && startDateControl.valid;

    if (startDateValid) {
      this.reviewCycleForm.get('endDate')?.enable();
      this.reviewCycleForm.get('dueDate')?.enable();
    } else {
      this.reviewCycleForm.get('endDate')?.reset();
      this.reviewCycleForm.get('endDate')?.disable();
      this.reviewCycleForm.get('dueDate')?.reset();
      this.reviewCycleForm.get('dueDate')?.disable();
    }
  }

  onDepartmentNameChange(event: any) {
    console.log(event)
    const joinedIds = event.value.map((item: any) => item).join(',');
    this.reviewCycleForm.get('subDepartmentId')?.reset();
    if (joinedIds) {
      this.getSubDepartmentsByDepID(joinedIds);
    }
    else {
      this.subDepartmentsDropdownValues = []
    }
  }

  getSubDepartmentsByDepID(id: any) {
    this.subscription = this.http
      .getData(`Subdepartments/Getnames/V2/${id}`)
      .subscribe({
        next: (data: any) => {
          this.subDepartmentsDropdownValues = data.map((subDepartment: any) => {
            return {
              ...subDepartment,
              fullName: `${subDepartment.subDepartmentName}`,
              selectedAllGroup: 'Group 2',
            };
          });
        },
      });
  }

  getAllDepartments() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data.map((department: any) => {
          return {
            ...department,
            fullName: `${department.departmentName}`,
            selectedAllGroup: 'Group 1',
          };
        });
      },
    });
  }

  getAllLocations() {
    this.subscription = this.http
      .getData('JobLocation/getAllLocations')
      .subscribe({
        next: (data: any) => {
          this.jobLocationDropDownData = data.map((location: any) => {
            return {
              ...location,
              fullName: `${location.jobLocationName}`,
              selectedAllGroup: 'Group 3',
            };
          });
        },
      });
  }
  getAllReviewCycleTypes() {
    const params = {
      entity: 'PMS',
      attribute: 'reviewType',
    };
    this.subscription = this.http
      .getDataIncludeParams('entityAttributeValues', params)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.ReviewCycleTypes = data;
        },
      });
  }
  onComplete() {
    this.modalService.dismissAll()
  }

  onClickNo() {
    this.onClickNoCancelPopUp.emit();
  }

  onClickYes() {
    this.modalService.dismissAll()
  }

  onReviewCycleSubmit() {
    this.isLoading = true;
    console.log(this.reviewCycleForm.value.locationId)
    if (this.reviewCycleForm.valid) {
      const data = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
      const reviewCycleData = {
        reviewCycleName: this.reviewCycleForm.value.reviewCycleName,
        startDate: this.reviewCycleForm.value.startDate,
        endDate: this.reviewCycleForm.value.endDate,
        dueDate: this.reviewCycleForm.value.dueDate,
        reviewCycleType: this.reviewCycleForm.value.reviewCycleType,
        applicableForIncrement: this.reviewCycleForm.value.applicableForIncrement,
        locationId: this.reviewCycleForm.value.locationId.join(','),
        subLocationId: this.reviewCycleForm.value.subLocationId.join(','),
        departmentId: this.reviewCycleForm.value.departmentId.join(','),
        subDepartmentId: this.reviewCycleForm.value.subDepartmentId.join(','),
        applicableEmployeesJoinedBefore:
          this.reviewCycleForm.value.applicableEmployeesJoinedBefore,
        description: this.reviewCycleForm.value.description,
        status: 'Created',
        createdBy: data.employeeId,
      };
      this.http.postdata('reviewCycleHeader', reviewCycleData).subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Review Cycle Created Successfully');
          // 
        },

        error: (error) => {
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('error.error.Message');
          // this.modalService.dismissAll();
        },
      });
    } else {
      this.reviewCycleForm.markAllAsTouched();
    }
  }

  OnClickLocation(event: any) {
    const joinedIds = event.value.map((item: any) => item).join(',');
    this.reviewCycleForm.get('subLocationId')?.reset();
    if (joinedIds) {
      this.getSubLocationByid(joinedIds);
    }
    else {
      this.subLocationsDropdown = []
    }
  }

  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations.map((subLocation: any) => {
          return {
            ...subLocation,
            fullName: `${subLocation.subLocationName}`,
            selectedAllGroup: 'Group 4',
          };
        });
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
