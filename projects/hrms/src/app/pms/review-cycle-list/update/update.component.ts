import { CommonModule } from '@angular/common';
import { Component, input, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-update',
  imports: [CommonModule, FormsModule, NgbPopoverModule, ReactiveFormsModule, Select, TranslateModule, MultiSelectModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  empinfo = {} as any;
  reviewCycleForm!: FormGroup;
  reviewCycleupdateForm!: FormGroup;
  page = 1;
  pageSize = 10;
  collectionSize = 100;
  ReviewCycleTypes: any;
  jobLocationDropDownData: any;
  subLocationsDropdown: any;
  departmentDetails: any;
  subDepartmentsDropdownValues: any;
  listofReviewTemplates: any
  todayDate = new Date().toISOString().split('T')[0]
  isLoading: boolean = false;
  dataload = false;
  searchText = '';
  reviewCyclesList: any[] = []
  filteredDetails: any[] = [];
  @ViewChild('cancelationConfirmation') cancelationConfirmation: any;
  @Input() updateData: any

  constructor(
    public readonly modalService: NgbModal,
    private readonly http: HttpService,
    private readonly fb: FormBuilder, private conformationPopup: OpenModalService,
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.initializeReviewCycleForm();
    this.getAllReviewCycleTypes();
    this.getAllDepartments();
    this.getAllLocations();
    this.getAllDepartments();
    if (this.updateData) {
      this.onUpdate(this.updateData);
    }
  }

  close() {
    this.modalService.dismissAll();
  }

  initializeReviewCycleForm() {
    this.reviewCycleForm = this.fb.group({
      reviewCycleName: ['', [Validators.required, Validators.maxLength(50), this.noWhitespaceValidator()]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      dueDate: [null, [this.dueDateAfterStartDateValidator('startDate')]],
      reviewCycleType: [null, Validators.required],
      applicableForIncrement: [false],
      locationId: [null, Validators.required],
      subLocationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      subDepartmentId: [null, Validators.required],
      applicableEmployeesJoinedBefore: [null, Validators.required],
      description: [null, [Validators.maxLength(50), this.noWhitespaceValidatordescrition()]],
      status: ['draft'],
      id: [null]
    },
      { validators: [this.startDateEndDateValidator(), this.joinDateEndDateValidator()] }
    );
    this.reviewCycleForm.get('startDate')?.valueChanges.subscribe(() => {
      this.toggleDateFields();
      this.reviewCycleForm.updateValueAndValidity();
    });
  }

  onReviewCycleUpdateSubmit(cycle: any) {
    if (this.reviewCycleForm.valid) {
      const reviewCycleData = {
        reviewCycleName: this.reviewCycleForm.value.reviewCycleName,
        startDate: this.reviewCycleForm.value.startDate,
        endDate: this.reviewCycleForm.value.endDate,
        reviewCycleType: this.reviewCycleForm.value.reviewCycleType,
        applicableForIncrement: this.reviewCycleForm.value.applicableForIncrement,
        locationId: this.reviewCycleForm.value.locationId.join(','),
        subLocationId: this.reviewCycleForm.value.subLocationId.join(','),
        departmentId: this.reviewCycleForm.value.departmentId.join(','),
        subDepartmentId: this.reviewCycleForm.value.subDepartmentId.join(','),
        applicableEmployeesJoinedBefore: this.reviewCycleForm.value.applicableEmployeesJoinedBefore,
        description: this.reviewCycleForm.value.description,
        reviewTemplateId: this.reviewCycleForm.value.reviewTemplateId,
      };
      this.http.putData(`reviewCycleHeader/update/${this.reviewCycleForm.value.id}`, reviewCycleData).subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Review cycle updated successfully')
        },
        error: (error) => {
          this.conformationPopup.openErrorModal(error.error.reason)
          console.error('Error:', error);
        }
      });
    } else {
      this.reviewCycleForm.markAllAsTouched();
    }
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

  updateDueDateValidator(): void {
    const startDate = this.reviewCycleForm.get('startDate')?.value;

    if (startDate) {
      this.reviewCycleForm.get('dueDate')?.enable();
      this.reviewCycleForm.get('dueDate')?.updateValueAndValidity();
    } else {
      this.reviewCycleForm.get('dueDate')?.reset();
      this.reviewCycleForm.get('dueDate')?.disable();
    }
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

  openUpdate() {
    this.getAllLocations()
    this.getAllDepartments()
    this.getAllReviewCycleTypes()
    this.getAllReviewTemplates()
  }

  openinitalUpdate() {
    this.getAllLocations()
    this.getAllDepartments()
    this.getAllReviewCycleTypes()
    this.getAllReviewTemplates()
  }

  onUpdate(cycle: any) {
    this.openUpdate()
    let locationIds = cycle.locations.map((item: any) => item.locationId).join(',');
    let subLocationIds = cycle.sublocations.map((item: any) => item.subLocationId).join(',');
    let depIds = cycle.departments.map((item: any) => item.departmentId).join(',')
    let subDepIds = cycle.subdepartments.map((item: any) => item.subDepartmentId).join(',')
    const formatDate = (date: any) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };
    this.reviewCycleForm.patchValue({
      reviewCycleName: cycle.reviewCycleName,
      startDate: formatDate(cycle.startDate), // Format to YYYY-MM-DD
      endDate: formatDate(cycle.endDate),
      dueDate: formatDate(cycle.dueDate),
      reviewCycleType: cycle.reviewCycleType,
      applicableForIncrement: cycle.applicableForIncrement,
      applicableEmployeesJoinedBefore: formatDate(cycle.applicableEmployeesJoinedBefore),
      departmentId: depIds.split(',').map(Number),
      subDepartmentId: subDepIds.split(',').map(Number),
      locationId: locationIds.split(',').map(Number),
      subLocationId: subLocationIds.split(',').map(Number),
      reviewTemplateId: cycle.reviewTemplateId,
      status: cycle.status,
      description: cycle.description,
      id: cycle.id
    });
    console.log(this.reviewCycleForm);

    this.getSubLocationByid(locationIds)
    this.getSubDepartmentsByDepID(depIds)
  }

  onUpdateintial(cycle: any) {
    this.openinitalUpdate()
    let locationIds = cycle.locations.map((item: any) => item.locationId).join(',');
    let subLocationIds = cycle.sublocations.map((item: any) => item.subLocationId).join(',');
    let depIds = cycle.departments.map((item: any) => item.departmentId).join(',')
    let subDepIds = cycle.subdepartments.map((item: any) => item.subDepartmentId).join(',')
    const formatDate = (date: any) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };
    this.reviewCycleupdateForm.patchValue({
      reviewCycleName: cycle.reviewCycleName,
      startDate: formatDate(cycle.startDate), // Format to YYYY-MM-DD
      endDate: formatDate(cycle.endDate),
      //dueDate: formatDate(cycle.dueDate),
      reviewCycleType: cycle.reviewCycleType,
      applicableForIncrement: cycle.applicableForIncrement,
      applicableEmployeesJoinedBefore: formatDate(cycle.applicableEmployeesJoinedBefore),
      departmentId: depIds.split(',').map(Number),
      subDepartmentId: subDepIds.split(',').map(Number),
      locationId: locationIds.split(',').map(Number),
      subLocationId: subLocationIds.split(',').map(Number),
      reviewTemplateId: cycle.reviewTemplateId,
      status: cycle.status,
      description: cycle.description,
      id: cycle.id
    });
    this.getSubLocationByid(locationIds)
    this.getSubDepartmentsByDepID(depIds)
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

  getAllReviewTemplates() {
    const params = {
      moduleid: environment.PMSrequestmoduleId,
    }
    this.subscription = this.http.getDataIncludeParams("Form/getAllFormDetails", params).subscribe({
      next: (data: any) => {
        this.listofReviewTemplates = data
      }
    })
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
      }
    })
  }

  onDepartmentNameChange(event: any) {
    const joinedIds = event.value.map((item: any) => item).join(',');
    this.reviewCycleForm.get('subDepartmentId')?.reset();
    if (joinedIds) {
      this.getSubDepartmentsByDepID(joinedIds);
    }
    else {
      this.subDepartmentsDropdownValues = []
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

  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isWhitespace = (control.value || '').trim() === '';
      const isValid = !isWhitespace;
      return isValid ? null : { whitespace: true };
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

  onReviewCycleintialUpdate() {
    if (this.reviewCycleupdateForm.valid) {
      const reviewCycleData = {
        reviewCycleName: this.reviewCycleupdateForm.value.reviewCycleName,
        startDate: this.reviewCycleupdateForm.value.startDate,
        endDate: this.reviewCycleupdateForm.value.endDate,
        dueDate: null,
        reviewCycleType: this.reviewCycleupdateForm.value.reviewCycleType,
        applicableForIncrement: this.reviewCycleupdateForm.value.applicableForIncrement,
        locationId: this.reviewCycleupdateForm.value.locationId?.join(','),
        subLocationId: this.reviewCycleupdateForm.value.subLocationId?.join(','),
        departmentId: this.reviewCycleupdateForm.value.departmentId?.join(','),
        subDepartmentId: this.reviewCycleupdateForm.value.subDepartmentId?.join(','),
        applicableEmployeesJoinedBefore: this.reviewCycleupdateForm.value.applicableEmployeesJoinedBefore,
        description: this.reviewCycleupdateForm.value.description,
        reviewTemplateId: this.reviewCycleupdateForm.value.reviewTemplateId,
      };
      this.http.putData(`reviewCycleHeader/update/${this.reviewCycleupdateForm.value.id}`, reviewCycleData).subscribe({
        next: (response) => {
          console.log('Success:', response);
          this.closeModal()
          this.onCreateCycleFormSubmitted()
          this.conformationPopup.openSuccessModal('Review cycle updated successfully')
        },
        error: (error) => {
          this.conformationPopup.openErrorModal(error.error.reason)
          console.error('Error:', error);
        }
      });
    } 
    else {
      this.reviewCycleForm.markAllAsTouched();
    }
  }

  closeModal() {
    this.openCancelationPopUp()
  }

  openCancelationPopUp() {
    this.modalService.open(this.cancelationConfirmation, { centered: true });
  }

  onCreateCycleFormSubmitted() {
    this.page = 1
    this.pageSize = 10
    this.getAllReviewCyclesList(this.page, this.pageSize)
  }

  getAllReviewCyclesList(pagenum: number, pagesize: number, fetchAll: boolean = false): void {
    const pageSize = fetchAll ? 10000 : this.pageSize; // Fetch all records if fetchAll is true
    const params = {
      page: pagenum,
      pageSize: pageSize,
      searchQuery: this.searchText
    };
    this.dataload = true;

    this.subscription = this.http.getpagentiontData("reviewCycleHeader", params).subscribe({
      next: (data: any) => {
        this.collectionSize = data.totalCount;
        this.reviewCyclesList = data.items || [];
        this.filteredDetails = this.reviewCyclesList;
        if (this.searchText) {
          this.filterDetails();
        }
        this.dataload = false;
      },
      error: (err: any) => {
        console.log("errors", err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  filterDetails(): void {
    if (!this.searchText) {
      this.filteredDetails = this.reviewCyclesList.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
      this.collectionSize = this.reviewCyclesList.length;
    } else {
      const searchTextLower = this.searchText.toLowerCase();
      const filtered = this.reviewCyclesList.filter(item => {
        return this.objectContainsText(item, searchTextLower);
      });
      this.collectionSize = filtered.length;
      this.filteredDetails = filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    }
    this.page = 1; // Reset to the first page
  }

  objectContainsText(obj: any, text: string): boolean {
    if (typeof obj === 'string') {
      return obj.toLowerCase().includes(text);
    }
    if (typeof obj === 'number') {
      return obj.toString().toLowerCase().includes(text);
    }
    if (Array.isArray(obj)) {
      return obj.some(item => this.objectContainsText(item, text));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(val => this.objectContainsText(val, text));
    }
    return false;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
